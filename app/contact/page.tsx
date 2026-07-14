import { LegalPage } from "@/components/LegalPage";
import { Mail } from "lucide-react";

export const metadata = { title: "اتصل بنا — ShelfShot AI" };

export default function ContactPage() {
  return (
    <LegalPage title="اتصل بنا" updatedAt="يوليو 2026">
      <p>
        لأي استفسار، مشكلة تقنية، أو طلب دعم يخص اشتراكك، يسعدنا تواصلك معنا عبر البريد الإلكتروني التالي وسنرد خلال 1-2 يوم عمل:
      </p>

      <div className="flex items-center gap-3 bg-panel border border-line rounded-xl2 p-5 not-prose">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Mail className="text-amber-400" size={18} />
        </div>
        <a href="mailto:support@shelfshotai.com" className="text-amber-400 hover:text-amber-300 font-semibold">
          support@shelfshotai.com
        </a>
      </div>

      <h2>معلومات النشاط</h2>
      <p>
        ShelfShot AI — خدمة رقمية لتوليد صور المنتجات بالذكاء الاصطناعي، تعمل عبر اشتراكات شهرية. النشاط مسجَّل في المملكة الأردنية الهاشمية.
      </p>
    </LegalPage>
  );
}
