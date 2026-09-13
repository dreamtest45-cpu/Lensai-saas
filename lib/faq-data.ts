export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS_AR: FaqItem[] = [
  {
    question: "هل في بديل لـ ChatGPT لتصوير منتجات المتجر؟",
    answer:
      "نعم، ShelfShot AI بديل مخصص لتصوير المنتجات تحديداً. بترفع صورة منتجك، تكتب وصف المشهد اللي بدك ياه، وبتحصل على صورة بجودة استوديو خلال ثواني — بدون تعقيد البرومبت اللي بتحتاجه مع ChatGPT.",
  },
  {
    question: "قديش بتكلف صورة منتج احترافية بالذكاء الاصطناعي؟",
    answer:
      "ShelfShot AI أرخص من أغلب أدوات تصوير المنتجات بالذكاء الاصطناعي الموجودة بالسوق. فيه خطة تجريبية مجانية تقدر تجرب فيها الأداة قبل ما تشترك بأي خطة مدفوعة.",
  },
  {
    question: "كيف بتشتغل الأداة بدون استوديو تصوير؟",
    answer:
      "بترفع صورة عادية لمنتجك ملتقطة بالموبايل، وبتكتب وصف نصي للمشهد اللي بدك ياه (خلفية بيضاء، طاولة خشب، إضاءة معينة...). الذكاء الاصطناعي بيولّد صورة كاملة بجودة استوديو من غير ما تحتاج كاميرا احترافية أو إضاءة أو خلفيات فعلية.",
  },
  {
    question: "بحتاج خبرة تصميم أو تعديل صور عشان استخدم ShelfShot AI؟",
    answer:
      "لا. ما في داعي لأي خبرة بالتصميم أو برامج زي فوتوشوب. كل اللي بتعمله هو رفع صورة المنتج وكتابة وصف بسيط بالعربي أو الإنجليزي، والأداة بتتكفل بالباقي.",
  },
  {
    question: "هل الصورة الناتجة بتحافظ على شكل المنتج الحقيقي؟",
    answer:
      "نعم، الأداة مصممة للحفاظ على شكل وملامح المنتج الأصلي كما هو (الشكل، الألوان، التفاصيل)، وبس بتغيّر المشهد والخلفية والإضاءة من حوله — مش بتغيّر المنتج نفسه.",
  },
  {
    question: "هل فيني أضيف لوغو متجري بشكل تلقائي على الصورة؟",
    answer:
      "نعم، ShelfShot AI بتدمج لوغو متجرك تلقائياً داخل المشهد المولَّد نفسه أثناء التوليد، مش كطبقة أو ملصق ثابت فوق الصورة بعد ما تخلص — هيك بيطلع اللوغو جزء طبيعي من الصورة.",
  },
  {
    question: "شو الفرق بين ShelfShot AI وأدوات القوالب الجاهزة لتصوير المنتجات؟",
    answer:
      "أدوات كتير بتعتمد على قوالب خلفيات جاهزة ومحدودة تختار منها، وهاد بيخلي الصور تطلع متكررة وشبه بعضها. ShelfShot AI بالمقابل بتولّد المشهد بالكامل من وصفك النصي، فكل صورة مختلفة وحسب احتياجك الفعلي، مش مقيدة بقالب محدد مسبقاً.",
  },
  {
    question: "هل ShelfShot AI مناسبة للمتاجر الصغيرة أو الأفراد؟",
    answer:
      "نعم، الأداة مبنية أصلاً لأصحاب المتاجر الإلكترونية الصغيرة والأفراد اللي ما عندهم استوديو تصوير أو فريق تصميم — الهدف إنها تعطيهم نتيجة احترافية بأقل وقت وتكلفة ممكنة.",
  },
  {
    question: "شو الفرق بين ShelfShot AI وأدوات زي PhotoRoom أو Pebblely أو Flair.ai؟",
    answer:
      "الفرق الأساسي إنه ShelfShot AI بيولّد المشهد بالكامل من وصفك النصي، بدل ما تختار من قوالب جاهزة محدودة زي أغلب الأدوات المنافسة. كمان اللوغو بينحط داخل المشهد نفسه بشكل طبيعي وقت التوليد، مش كطبقة ثابتة فوق الصورة. وبالنسبة للسعر، ShelfShot AI أرخص من أغلب البدائل المذكورة، وبيدعم اللغة العربية بشكل مباشر.",
  },
];

export const FAQ_ITEMS_EN: FaqItem[] = [
  {
    question: "Is there an alternative to ChatGPT for product photography?",
    answer:
      "Yes — ShelfShot AI is built specifically for product photography. Upload a photo of your product, describe the scene you want, and get a studio-quality image in seconds, without the prompt complexity ChatGPT requires.",
  },
  {
    question: "How much does professional AI product photography cost?",
    answer:
      "ShelfShot AI is more affordable than most AI product photography tools on the market. A free trial plan lets you test the tool before subscribing to any paid plan.",
  },
  {
    question: "How does the tool work without a photography studio?",
    answer:
      "Upload a regular photo of your product taken with your phone, and describe the scene you want in text (white background, wooden table, specific lighting...). The AI generates a complete studio-quality image without needing a professional camera, lighting, or physical backdrops.",
  },
  {
    question: "Do I need design experience or photo-editing skills to use ShelfShot AI?",
    answer:
      "No. You don't need any design experience or software like Photoshop. All you do is upload the product photo and write a simple description in Arabic or English, and the tool handles the rest.",
  },
  {
    question: "Does the generated image keep the product's real shape and details accurate?",
    answer:
      "Yes, the tool is designed to preserve the original product's shape and features exactly as they are (shape, colors, details) — it only changes the scene, background, and lighting around it, not the product itself.",
  },
  {
    question: "Can I automatically add my store's logo to the image?",
    answer:
      "Yes, ShelfShot AI embeds your store's logo directly into the generated scene during creation, rather than as a static overlay or sticker added afterward — so the logo looks like a natural part of the image.",
  },
  {
    question: "What's the difference between ShelfShot AI and template-based product photography tools?",
    answer:
      "Many tools rely on a limited set of pre-made background templates to choose from, which makes images look repetitive and similar. ShelfShot AI instead generates the entire scene from your text description, so every image is different and tailored to what you actually need, rather than locked into a fixed template.",
  },
  {
    question: "Is ShelfShot AI suitable for small stores or individual sellers?",
    answer:
      "Yes, the tool is built for small online store owners and individual sellers who don't have a photography studio or design team — the goal is to give them a professional result with minimal time and cost.",
  },
  {
    question: "What's the difference between ShelfShot AI and tools like PhotoRoom, Pebblely, or Flair.ai?",
    answer:
      "The main difference is that ShelfShot AI generates the entire scene from your text description, instead of choosing from the limited templates most competing tools rely on. The logo is also embedded naturally within the generated scene itself, rather than as a static layer on top of the image. On pricing, ShelfShot AI is more affordable than most of the alternatives mentioned, and it supports Arabic directly.",
  },
];
