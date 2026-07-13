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
    You are a world-class professional product photographer and digital artist.
    Task: Create a photorealistic, cinematic product shot based on the input image(s) and the user's description.

    Input 1: The main product.
    ${logoBase64 ? "Input 2: The brand logo." : ""}

    User Description: "${prompt}"

    Instructions:
    1. Visualize the product in the described setting.
    2. Lighting must be cinematic, clean, and high-end (studio quality).
    3. ${logoBase64 ? "Integrate the logo naturally onto the product surface or place it elegantly in the scene if explicitly asked, otherwise ensure the product branding is highlighted." : "Ensure the product looks premium."}
    4. Return ONLY the generated image.
    5. Aspect Ratio: 1:1.
    6. Style: 8k resolution, highly detailed, commercial photography.
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

    const content = response.candidates?.[0]?.content;
    const imagePart = content?.parts?.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
      return NextResponse.json(
        { error: "لم يُرجع النموذج صورة. ربما رفض الطلب — جرّب صياغة مختلفة." },
        { status: 502 }
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
    return NextResponse.json(
      { error: "حدث خطأ أثناء توليد الصورة. الرجاء المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}
