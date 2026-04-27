import Layout from "@/components/Layout";
import { ArrowRight } from "lucide-react";

interface PlaceholderSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
}

export default function PlaceholderSection({
  title,
  description,
  icon,
  color = "from-purple-600 to-indigo-700",
}: PlaceholderSectionProps) {
  return (
    <Layout>
      <section className={`bg-gradient-to-r ${color} py-16`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl text-white">{icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {title}
            </h1>
          </div>
          <p className="text-white/90 text-lg">{description}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
              <span className="text-2xl">🔨</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">قريبا جداً</h2>
            <p className="text-gray-600 text-lg mb-8">
              نحن نعمل على هذا القسم لتقديم أفضل تجربة لك. تابعنا للحصول على
              التحديثات الأخيرة!
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-[#8b0000] font-semibold hover:translate-x-2 transition-transform cursor-pointer">
            <a href="https://wa.me/212675202336" className="flex items-center gap-2">
              <span>تواصل معنا على WhatsApp</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-2xl mb-3">📦</div>
            <h3 className="font-bold mb-2">منتجات متنوعة</h3>
            <p className="text-gray-600 text-sm">
              اختيار واسع من المنتجات الجودة العالية
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-2xl mb-3">💬</div>
            <h3 className="font-bold mb-2">دعم متاح</h3>
            <p className="text-gray-600 text-sm">
              فريق جاهز للإجابة على أسئلتك والمساعدة
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-bold mb-2">خدمة سريعة</h3>
            <p className="text-gray-600 text-sm">
              معالجة سريعة وآمنة لجميع الطلبات
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
