# LensAI (ShelfShot AI) — SaaS كامل لتوليد صور المنتجات بالذكاء الاصطناعي

مبني فوق فكرة تطبيقك الأصلي من AI Studio، لكن بمعمارية SaaS حقيقية:
- **Next.js 14** (App Router) + TypeScript + Tailwind
- **Supabase**: تسجيل الدخول (Auth) + قاعدة بيانات Postgres + Storage لتخزين الصور المولّدة
- **MEPS (PayTabs Jordan)**: اشتراكات شهرية (Hosted Checkout + Webhook موثّق بتوقيع HMAC + إلغاء يبقى فعّال لحد نهاية الفترة المدفوعة)
- **Gemini** (`gemini-3.1-flash-image-preview`): التوليد يتم **على الخادم فقط** — المفتاح لا يصل للمتصفح إطلاقاً
- حدود استخدام شهرية حسب الخطة (مجاني / بداية / اقتصادي / احترافي)

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
3. افتح **SQL Editor** ونفّذ محتوى ملف `supabase/schema.sql` كامل مرة واحدة (الملف قابل لإعادة التشغيل بأمان لو احتجت تشغّله أكثر من مرة). هذا بينشئ:
   - جدول `profiles` (خطة كل مستخدم: `free` / `starter` / `economic` / `pro`)
   - جدول `generations` (سجل + عدّاد الاستخدام الشهري)
   - جدول `transactions` (سجل محاولات الدفع عبر MEPS، معلّق → مدفوع/فاشل)
   - **Storage bucket باسم `generations`** (عام، لتخزين الصور المولَّدة) + صلاحيات الوصول له
   - Row Level Security بحيث كل مستخدم يشوف بياناته فقط، وما حدا (ولا حتى صاحب الحساب من كونسول المتصفح) يقدر يعدّل خطته الاشتراكية مباشرة — هذا محصور بكود الخادم فقط
4. من **Authentication → URL Configuration** ضيف رابط موقعك (بعد النشر) و `http://localhost:3000` كـ Redirect URLs، وضيف `/auth/callback` بعدها.
5. تحقق من إنشاء الـ bucket: **Storage** بلوحة تحكم Supabase، لازم تشوف bucket اسمه `generations`. لو ما ظهر (مثلاً صلاحيات SQL Editor ما تسمح بإنشاء buckets بحسابك)، أنشئه يدوياً من نفس الصفحة (New bucket → الاسم `generations` → فعّل Public bucket)، وطبّق سياسات الوصول (RLS Policies) المذكورة بآخر `supabase/schema.sql` يدوياً من تبويب Policies.

---

## 3) إعداد الدفع — MEPS (PayTabs Jordan)

المشروع يستخدم **MEPS/PayTabs الأردن** لمعالجة الاشتراكات (وليس Stripe — كود Stripe تم إزالته لأنه لم يكن مستخدَماً فعلياً).

1. من لوحة تحكم PayTabs احصل على:
   - **Profile ID** → `MEPS_PROFILE_ID`
   - **Server Key** (من "مفاتيح الربط" → "مفتاح الخادم"، **وليس** المفتاح العام/الخاص بالمتصفح) → `MEPS_SERVER_KEY`
2. تأكد أن `NEXT_PUBLIC_SITE_URL` مضبوط على رابط موقعك الحقيقي (يُستخدم لبناء روابط `callback` و`return` عند إنشاء عملية الدفع).
3. تدفّق الدفع الفعلي في الكود:
   - `POST /api/checkout` — يبدأ عملية دفع MEPS للخطة المختارة، ويسجّل صف `pending` في جدول `transactions`.
   - `POST /api/webhooks/meps` — يستقبل تأكيد الدفع من MEPS (server-to-server، بدون جلسة مستخدم). **يتحقق أولاً من توقيع HMAC-SHA256** المُرسَل بترويسة `Signature` (باستخدام `MEPS_SERVER_KEY`) قبل الوثوق بأي شيء بالمحتوى — بدون هذا التحقق، أي شخص يقدر يخمّن أو يشوف `cart_id` كان ممكن يرسل طلب دفع مزوّر ويفعّل خطة مدفوعة مجاناً. راجع `lib/meps.ts` (دالة `verifyMepsSignature`) و[توثيق PayTabs لتحقق التوقيع](https://support.paytabs.com/en/support/solutions/articles/60000718961).
   - `GET /api/meps-return` — صفحة عودة المستخدم بعد إتمام الدفع على صفحة MEPS المستضافة.
   - `POST /api/cancel-subscription` — إلغاء **لا ينزّل الخطة فوراً**: المستخدم يضل مستفيد من خطته المدفوعة لحد `current_period_end` (تاريخ نهاية الفترة اللي دفع عنها أصلاً)، وبعدها مهمة مجدولة (Cron، فقرة 4 تحت) بترجّعه تلقائياً لخطة مجاني.
4. سجّل رابط الـ webhook عند PayTabs بحيث يوجّه لـ: `https://YOUR-DOMAIN/api/webhooks/meps`. تأكد أن PayTabs مفعّل عندهم إرسال ترويسة `Signature` مع كل webhook (افتراضي عادةً، لكن تأكد من إعدادات حسابك).

---

## 4) مهمة الإلغاء المجدولة (Cron)

المسار `app/api/cron/downgrade-expired/route.ts` بيفحص يومياً مين خلصت فترته المدفوعة وحالته "ملغى"، ويرجّعه تلقائياً لخطة مجاني. الجدولة نفسها معرّفة بـ `vercel.json` (يومياً الساعة 03:00 UTC).

- **لازم** تضيف متغير بيئة `CRON_SECRET` (قيمة عشوائية طويلة، مثلاً عن طريق `openssl rand -hex 32`) بنفس القيمة بـ Vercel. Vercel Cron بيرسلها تلقائياً كترويسة `Authorization: Bearer <القيمة>` مع كل استدعاء مجدول، وهذا هو الحماية الوحيدة اللي تمنع أي حدا يلاقي رابط المسار من استدعائه يدوياً.
- بدون `CRON_SECRET`، المسار برجّع 401 دايماً ولن يشتغل — تأكد من ضبطه قبل الاعتماد عليه بالإنتاج.

---

## 5) مفتاح Gemini

من [aistudio.google.com](https://aistudio.google.com/apikey) خذ مفتاح API وحطه في `GEMINI_API_KEY` — بدون `NEXT_PUBLIC_` عشان يضل سري على الخادم فقط.

---

## 6) التشغيل محلياً

```bash
npm run dev
```

افتح `http://localhost:3000`.

---

## 7) النشر على Vercel

1. ارفع المشروع على GitHub.
2. من [vercel.com](https://vercel.com) استورد الريبو.
3. ضيف كل المتغيرات اللي بملف `.env.example` (بما فيها `CRON_SECRET`) في **Project Settings → Environment Variables** (بنفس الأسماء).
4. غيّر `NEXT_PUBLIC_SITE_URL` لرابط موقعك الحقيقي بعد أول نشر.
5. ارجع لخطوة MEPS Webhook فوق وسجّل الرابط النهائي.
6. تأكد أن Vercel فعّلت الـ Cron Job تلقائياً (يظهر بتبويب "Cron Jobs" بإعدادات المشروع) — بيُقرأ من `vercel.json` تلقائياً عند أول نشر.

---

## بنية المشروع

```
app/
  page.tsx                       → الصفحة الرئيسية (Landing + الأسعار)
  login/page.tsx                 → تسجيل الدخول / إنشاء حساب
  dashboard/                     → لوحة التحكم (محمية، تتطلب تسجيل دخول)
  api/generate/route.ts          → يستدعي Gemini على الخادم، يتحقق من حد الاستخدام، يرفع النتيجة لـ Storage
  api/checkout/route.ts          → ينشئ عملية دفع MEPS ويسجّل transaction معلّقة
  api/webhooks/meps/route.ts     → يتحقق من توقيع MEPS ثم يفعّل الخطة عند نجاح الدفع
  api/meps-return/route.ts       → صفحة عودة المستخدم بعد الدفع
  api/cancel-subscription/route.ts → يعلّم الاشتراك كـ "ملغى" (يضل فعّال لحد نهاية الفترة)
  api/cron/downgrade-expired/route.ts → مهمة يومية تُنزّل الحسابات المنتهية فترتها لخطة مجاني
lib/
  supabase/                      → عملاء Supabase (متصفح / خادم / صلاحيات كاملة)
  plans.ts                       → تعريف الخطط والحدود
  meps.ts                        → عميل MEPS/PayTabs + تحقق توقيع الـ webhook
supabase/schema.sql               → مخطط قاعدة البيانات كامل (profiles + generations + transactions + storage bucket)
vercel.json                       → جدولة الـ Cron
```

---

## الخطط الفعلية (`lib/plans.ts`)

| الخطة | id | صور شهرياً | السعر |
|---|---|---|---|
| مجاني | `free` | 3 | $0 |
| بداية | `starter` | 20 | $6 |
| اقتصادي | `economic` | 50 | $15 |
| احترافي | `pro` | 150 | $39 |

عدّل الأرقام والأسعار من `lib/plans.ts` متى ما بدك — تذكّر تحديث الـ check constraints المرتبطة بـ `plan`/`plan_id` بـ `supabase/schema.sql` لو غيّرت أسماء الخطط.

---

## الأمان — ملخص ما تمت مراجعته وإصلاحه

- **توقيع Webhook إلزامي**: `app/api/webhooks/meps` يرفض أي طلب بدون توقيع HMAC صحيح، فما حدا يقدر يزوّر إشعار دفع.
- **لا صلاحية تعديل مباشرة على `profiles` من المتصفح**: تم حذف أي RLS policy تسمح لمستخدم بتعديل صف نفسه بجدول `profiles` — تغيير الخطة/حالة الاشتراك مقصور فقط على كود الخادم (عبر مفتاح service role)، فما حدا يقدر يرقّي نفسه لخطة مدفوعة مجاناً عن طريق نداء Supabase مباشرة من كونسول المتصفح.
- **جدول `transactions`**: سياسة الإدخال تسمح فقط بإدخال صفوف بحالة `pending`، فما حدا يقدر يدخل صف يبدو "مدفوع" مسبقاً.
- **حماية من Open Redirect**: `app/auth/callback` يتحقق أن رابط `next` مسار داخلي فقط، مش رابط خارجي.
- **حد أقصى لحجم الصور المرفوعة** بـ `api/generate` لمنع إساءة استخدام تكلفة Gemini عبر طلبات ضخمة.
- **Cron محمي بمفتاح سري** (`CRON_SECRET`) — بدونه، مسار الإلغاء التلقائي مرفوض دائماً.

نقاط تستحق اهتماماً إضافياً مستقبلاً (مش عاجلة، لكن يفضل معرفتها):
- لا يوجد حالياً Rate Limiting صريح على `api/generate` غير الحد الشهري نفسه — مستخدم يقدر يستهلك حصته الشهرية كاملة بوقت قصير جداً. مقبول للـ MVP.
- لا يوجد CSRF token صريح على الـ API routes (نعتمد على SameSite cookies من Supabase) — مقبول لنمط الاستخدام الحالي (كل الطلبات من نفس الدومين).

---

## ملاحظات مهمّة إضافية

- **البريد الإلكتروني**: تأكيد التسجيل يستخدم قوالب Supabase الافتراضية — تقدر تخصصها من Authentication → Email Templates.
- **خصوصية الصور**: bucket `generations` عام افتراضياً (مناسب لصور منتجات تسويقية، مش محتوى حساس) مع مسارات عشوائية غير قابلة للتخمين. لو بدك خصوصية أشد، بدّل `public` لـ `false` بـ `supabase/schema.sql` واستخدم signed URLs بدل `getPublicUrl` بـ `api/generate/route.ts`.
- **الأمان العام**: مفتاح Gemini و`SUPABASE_SERVICE_ROLE_KEY` و`MEPS_SERVER_KEY` و`CRON_SECRET` يجب تبقى دائماً بدون `NEXT_PUBLIC_`.
