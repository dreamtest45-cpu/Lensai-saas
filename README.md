# LensAI — SaaS كامل لتوليد صور المنتجات بالذكاء الاصطناعي

مبني فوق فكرة تطبيقك الأصلي من AI Studio، لكن بمعمارية SaaS حقيقية:
- **Next.js 14** (App Router) + TypeScript + Tailwind
- **Supabase**: تسجيل الدخول (Auth) + قاعدة بيانات Postgres
- **Stripe**: اشتراكات شهرية (Checkout + Customer Portal + Webhook)
- **Gemini** (`gemini-2.5-flash-image`): التوليد يتم **على الخادم فقط** — المفتاح لا يصل للمتصفح إطلاقاً
- حدود استخدام شهرية حسب الخطة (مجاني / احترافي / أعمال)

---

## 1) تجهيز المشروع محلياً

```bash
npm install
cp .env.example .env.local
```

---

## 2) إعداد Supabase

1. أنشئ مشروع جديد على [supabase.com](https://supabase.com).
2. من **Project Settings → API** انسخ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (سري، لا تشاركه أبداً ولا تحطه بمتغير عام NEXT_PUBLIC_)
3. افتح **SQL Editor** ونفّذ محتوى ملف `supabase/schema.sql` كامل مرة واحدة. هذا بينشئ:
   - جدول `profiles` (خطة كل مستخدم، Stripe customer id)
   - جدول `generations` (سجل + عدّاد الاستخدام الشهري)
   - Row Level Security بحيث كل مستخدم يشوف بياناته فقط
4. من **Authentication → URL Configuration** ضيف رابط موقعك (بعد النشر) و `http://localhost:3000` كـ Redirect URLs، وضيف `/auth/callback` بعدها.

---

## 3) إعداد Stripe

1. أنشئ حساب على [stripe.com](https://stripe.com) (فعّل وضع Test أول شي للتجربة).
2. من **Product catalog** أنشئ منتجين:
   - "LensAI Pro" — سعر شهري متكرر (مثلاً $9)
   - "LensAI Business" — سعر شهري متكرر (مثلاً $29)
3. انسخ **Price ID** لكل خطة إلى:
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO`
   - `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS`
4. من **Developers → API keys** انسخ `Secret key` إلى `STRIPE_SECRET_KEY`.
5. **الـ Webhook** (لازم بعد ما تنشر على Vercel لأنه يحتاج رابط عام):
   - Developers → Webhooks → Add endpoint
   - Endpoint URL: `https://YOUR-DOMAIN/api/stripe/webhook`
   - Events تحتاجها: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - انسخ `Signing secret` إلى `STRIPE_WEBHOOK_SECRET`

---

## 4) مفتاح Gemini

من [aistudio.google.com](https://aistudio.google.com/apikey) خذ مفتاح API وحطه في `GEMINI_API_KEY` — بدون `NEXT_PUBLIC_` عشان يضل سري على الخادم فقط.

---

## 5) التشغيل محلياً

```bash
npm run dev
```

افتح `http://localhost:3000`.

---

## 6) النشر على Vercel

1. ارفع المشروع على GitHub.
2. من [vercel.com](https://vercel.com) استورد الريبو.
3. ضيف كل المتغيرات اللي بملف `.env.example` في **Project Settings → Environment Variables** (بنفس الأسماء).
4. غيّر `NEXT_PUBLIC_SITE_URL` لرابط موقعك الحقيقي بعد أول نشر.
5. ارجع لخطوة Stripe Webhook فوق وسجّل الرابط النهائي.

---

## بنية المشروع

```
app/
  page.tsx                 → الصفحة الرئيسية (Landing + الأسعار)
  login/page.tsx           → تسجيل الدخول / إنشاء حساب
  dashboard/                → لوحة التحكم (محمية، تتطلب تسجيل دخول)
  api/generate/route.ts     → يستدعي Gemini على الخادم + يتحقق من حد الاستخدام
  api/stripe/checkout       → ينشئ جلسة دفع Stripe
  api/stripe/portal         → يفتح صفحة إدارة الاشتراك
  api/stripe/webhook        → يستقبل تحديثات الاشتراك من Stripe
lib/
  supabase/                 → عملاء Supabase (متصفح / خادم / صلاحيات كاملة)
  plans.ts                  → تعريف الخطط والحدود
  stripe.ts                 → عميل Stripe
supabase/schema.sql          → مخطط قاعدة البيانات كامل
```

---

## ملاحظات مهمّة قبل الإطلاق الفعلي

- **تخزين الصور**: حالياً النتائج تُخزّن كـ base64 مباشرة في عمود نصي بقاعدة البيانات (أبسط حل للـ MVP). لو حجم الاستخدام كبر، الأفضل ترفعها لـ **Supabase Storage** أو S3 وتخزّن الرابط فقط.
- **حدود الخطط**: عدّل الأرقام والأسعار من `lib/plans.ts` متى ما بدك.
- **البريد الإلكتروني**: تأكيد التسجيل يستخدم قوالب Supabase الافتراضية — تقدر تخصصها من Authentication → Email Templates.
- **الأمان**: مفتاح Gemini و `SUPABASE_SERVICE_ROLE_KEY` و `STRIPE_SECRET_KEY` يجب تبقى بدون `NEXT_PUBLIC_` دائماً.
