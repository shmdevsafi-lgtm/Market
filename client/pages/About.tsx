import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Heart, Zap, Users, Shield } from "lucide-react";

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            عن منصة SHM
          </h1>
          <p className="text-xl text-green-100">
            منصة متخصصة في تقديم المعدات والمشاريع والخدمات الابتكارية
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">رسالتنا</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              نسعى إلى توفير منصة موثوقة وسهلة الاستخدام تجمع بين الجودة والابتكار.
              نحن ملتزمون بتقديم أفضل الخدمات والمنتجات لعملائنا الكرام.
            </p>
            <p className="text-gray-700 leading-relaxed">
              من خلال فريق محترف وخبير، نعمل على تطوير حلول مبتكرة تلبي احتياجات
              السوق المتنوعة والمتطورة.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">رؤيتنا</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              أن نصبح المنصة الأولى والمفضلة للعملاء في مجال المعدات والمشاريع
              والخدمات الابتكارية.
            </p>
            <p className="text-gray-700 leading-relaxed">
              نؤمن بأن الجودة والموثوقية والابتكار هي المفاتيح الرئيسية للنجاح
              والنمو المستدام.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
          قيمنا الأساسية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="font-bold mb-2">الالتزام</h3>
            <p className="text-sm text-gray-600">
              نلتزم بتقديم أفضل الخدمات لعملائنا
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="font-bold mb-2">الابتكار</h3>
            <p className="text-sm text-gray-600">
              نبحث دائماً عن حلول جديدة وإبداعية
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-bold mb-2">التعاون</h3>
            <p className="text-sm text-gray-600">
              نعتقد بقوة العمل الجماعي والشراكات
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-bold mb-2">الشفافية</h3>
            <p className="text-sm text-gray-600">
              نتعامل بصراحة وأمانة مع جميع عملائنا
            </p>
          </Card>
        </div>

        {/* Team Section */}
        <Card className="p-8 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">فريقنا</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            يتكون فريقنا من محترفين ذوي خبرة عالية في مجالاتهم. كل عضو في فريقنا
            مكرس لتقديم أفضل جودة وخدمة عملاء ممتازة.
          </p>
          <p className="text-gray-700 leading-relaxed">
            نحن فخورون بتنوع فريقنا وقدرته على العمل بكفاءة وفعالية لتحقيق أهدافنا
            المشتركة.
          </p>
        </Card>
      </section>
    </Layout>
  );
}
