import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function Privacy() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Lock className="h-12 w-12 text-white" />
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              سياسة الخصوصية
            </h1>
            <p className="text-xl text-blue-100 mt-2">
              حماية بيانات عملائنا هي أولويتنا الأساسية
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">مقدمة</h2>
          <p className="text-gray-700 leading-relaxed">
            تلتزم منصة SHM بحماية خصوصيتك وبيانات شخصية. تصف هذه السياسة كيفية جمعنا
            واستخدامنا ونقلنا حماية المعلومات عند استخدامك للمنصة.
          </p>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            1. البيانات التي نجمعها
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">البيانات الشخصية:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>الاسم والبريد الإلكتروني</li>
                <li>رقم الهاتف والعنوان</li>
                <li>معلومات الدفع والحسابات البنكية</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">بيانات الاستخدام:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>سجل الأنشطة والعمليات</li>
                <li>المنتجات التي تصفحتها</li>
                <li>معلومات الجهاز والمتصفح</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            2. كيفية استخدام بيانات
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>✓ توفير الخدمات والمنتجات التي طلبتها</li>
            <li>✓ معالجة الدفع والتحويلات المالية</li>
            <li>✓ إرسال تحديثات حول حسابك والطلبات</li>
            <li>✓ تحسين تجربة المستخدم والخدمات</li>
            <li>✓ الامتثال للقوانين والمتطلبات القانونية</li>
          </ul>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            3. حماية البيانات
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            نستخدم تقنيات تشفير حديثة وإجراءات أمان صارمة لحماية بيانات عملائنا. جميع
            المعاملات محمية بشهادات SSL وتشفير متقدم.
          </p>
          <p className="text-gray-700 leading-relaxed">
            فريق أمان متخصص يراقب بشكل مستمر أي تهديدات محتملة ويتخذ إجراءات وقائية.
          </p>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            4. مشاركة البيانات
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            لا نشارك بيانات عملائنا مع أطراف ثالثة دون موافقة صريحة، باستثناء الحالات
            التالية:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• شركات الدفع والمعاملات المالية</li>
            <li>• خدمات الشحن والتوصيل</li>
            <li>• الامتثال بالقوانين والمتطلبات القانونية</li>
          </ul>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            5. حقوق المستخدم
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            لديك الحق في:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>✓ الوصول إلى بيانات شخصية</li>
            <li>✓ تصحيح أو تحديث المعلومات غير صحيحة</li>
            <li>✓ حذف حسابك وبيانات شخصية</li>
            <li>✓ الاعتراض على معالجة معينة للبيانات</li>
          </ul>
        </Card>

        <Card className="p-8 bg-blue-50">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">التواصل بنا</h2>
          <p className="text-gray-700 leading-relaxed">
            إذا كان لديك أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد
            الإلكتروني أو الاتصال بفريق دعم العملاء لدينا.
          </p>
        </Card>
      </section>
    </Layout>
  );
}
