import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { PLANS, PlanId } from "@/lib/plans";

export const runtime = "nodejs";
export const maxDuration = 60;

function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

// Generic, user-facing message for any case where Gemini refuses to generate
// because the input contains sensitive/identifying information (license
// plates, faces, ID numbers, addresses, etc.) — not tied to one specific case.
const SENSITIVE_CONTENT_MESSAGE =
  "تعذّر توليد الصورة لأنها قد تحتوي على معلومات تعريفية أو حساسة (مثل لوحات الترخيص، الوجوه، أو أرقام تعريفية). الرجاء تعديل الصورة (مثل تغطية أو إخفاء هذه العناصر) وإعادة المحاولة.";

export async function POST(req: NextRequest) {
  const supabase = createClient();

  // 1. Require an authenticated user — the Gemini key never reaches the browser.
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "الرجاء تسجيل الدخول أولاً." }, { status: 401 });
  }

  // 2. Load plan + enforce the monthly usage limit.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan: PlanId = (profile?.plan as PlanId) || "free";
  const limit = PLANS[plan].monthlyGenerations;

  const { count } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfMonthISO());

  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      {
        error: `وصلت للحد الأقصى (${limit} صورة) لهذا الشهر في خطة "${PLANS[plan].nameAr}". قم بترقية الخطة للمتابعة.`,
        limitReached: true,
      },
      { status: 403 }
    );
  }

  // 3. Parse the request body: base64 images + text prompt.
  const body = await req.json();
  const { productBase64, productMimeType, logoBase64, logoMimeType, prompt } = body as {
    productBase64?: string;
    productMimeType?: string;
    logoBase64?: string;
    logoMimeType?: string;
    prompt?: string;
  };

  if (!productBase64 || !prompt?.trim()) {
    return NextResponse.json({ error: "صورة المنتج والوصف مطلوبان." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "لم يتم إعداد مفتاح Gemini على الخادم." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const basePrompt = `
    You are a professional product photographer shooting with a high-end DSLR camera (e.g. Canon EOS R5) in a real studio.
    Task: Create a photorealistic product photo based on the input image(s) and the user's description.

    Input 1: The main product.
    ${logoBase64 ? "Input 2: The brand logo." : ""}

    User Description: "${prompt}"

    Instructions:
    1. Visualize the product in the described setting as if physically photographed, not digitally rendered.
    2. Lighting must look like real studio lighting (softbox/natural light) — avoid an overly smooth, plastic, or "airbrushed" look.
    3. Preserve natural material textures, subtle imperfections, and realistic shadows/reflections — do not over-sharpen or over-saturate.
    4. ${logoBase64 ? "Integrate the logo naturally onto the product surface or place it elegantly in the scene if explicitly asked, otherwise ensure the product branding is highlighted." : "Ensure the product looks premium and true-to-life."}
    5. Return ONLY the generated image.
    6. Aspect Ratio: 1:1.
    7. Style: natural commercial product photography, true colors, subtle realistic depth of field — avoid a synthetic/CGI/over-processed AI look.
    8. CRITICAL: Preserve the exact shape, form, texture, and toppings of the product exactly as shown in the input image — do not redesign, restyle, or reinterpret the product itself, only the surrounding scene and lighting.
  `;

  const parts: any[] = [
    { inlineData: { data: productBase64, mimeType: productMimeType || "image/png" } },
  ];
  if (logoBase64) {
    parts.push({ inlineData: { data: logoBase64, mimeType: logoMimeType || "image/png" } });
  }
  parts.push({ text: basePrompt });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: { parts },
    });

    // --- Check for a safety/content block BEFORE assuming a missing image
    // means something else. Gemini reports blocks in two places:
    //   1. promptFeedback.blockReason — the whole prompt was blocked
    //   2. candidates[0].finishReason === "SAFETY" (or similar) — the
    //      response generation itself was halted for safety reasons
    // Common triggers: visible license plates, faces, ID numbers, addresses,
    // or other identifying/sensitive info in the uploaded image.
    const blockReason = (response as any).promptFeedback?.blockReason;
    const candidate = response.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const isSafetyBlocked =
      !!blockReason ||
      finishReason === "SAFETY" ||
      finishReason === "PROHIBITED_CONTENT" ||
      finishReason === "BLOCKLIST" ||
      finishReason === "SPII"; // Sensitive PII, if the SDK surfaces it this way

    if (isSafetyBlocked) {
      return NextResponse.json({ error: SENSITIVE_CONTENT_MESSAGE }, { status: 422 });
    }

    const content = candidate?.content;
    const imagePart = content?.parts?.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
      // No explicit block flag, but still no image — treat conservatively
      // as a possible content-sensitivity issue rather than a vague error,
      // since this is the most common real-world cause.
      return NextResponse.json(
        { error: SENSITIVE_CONTENT_MESSAGE },
        { status: 422 }
      );
    }

    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const resultUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    // 4. Record the generation (also serves as this month's usage counter).
    await supabase.from("generations").insert({
      user_id: user.id,
      prompt,
      result_url: resultUrl,
    });

    return NextResponse.json({ url: resultUrl });
  } catch (err: any) {
    console.error("Gemini generation error:", err);

    // If the underlying SDK error text hints at a safety/policy block,
    // surface the same clear, generic message instead of a raw/technical one.
    const rawMessage = String(err?.message || "");
    const looksLikeSafetyBlock = /safety|blocked|prohibited|policy|sensitive/i.test(rawMessage);

    return NextResponse.json(
      {
        error: looksLikeSafetyBlock
          ? SENSITIVE_CONTENT_MESSAGE
          : "حدث خطأ أثناء توليد الصورة. الرجاء المحاولة مرة أخرى.",
      },
      { status: looksLikeSafetyBlock ? 422 : 500 }
    );
  }
}
