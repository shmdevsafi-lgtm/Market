import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";

export default function Security() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-12">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Shield className="h-12 w-12 text-white" />
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              سياسة الأمان
            </h1>
            <p className="text-xl text-purple-100 mt-2">
              تقنيات أمان متقدمة لحماية حسابك
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-16">
        {/* Overview */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">نظرة عامة</h2>
          <p className="text-gray-700 leading-relaxed">
            أمان عملائنا هو أهم أولوياتنا. نستثمر بشكل مستمر في التقنيات والموارد
            الأمنية لحماية البيانات والأصول الرقمية.
          </p>
        </Card>

        {/* Security Measures */}
        <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
          إجراءات الأمان
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <Lock className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-3">التشفير</h3>
            <p className="text-gray-700 text-sm">
              نستخدم تشفير SSL/TLS 256-bit لجميع الاتصالات. البيانات الحساسة يتم
              تشفيرها في قاعدة البيانات.
            </p>
          </Card>

          <Card className="p-6">
            <Eye className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-3">المراقبة</h3>
            <p className="text-gray-700 text-sm">
              مراقبة 24/7 من قبل فريق أمان متخصص. نسجلات الدخول والعمليات المريبة
              يتم رصدها تلقائياً.
            </p>
          </Card>

          <Card className="p-6">
            <AlertTriangle className="h-8 w-8 text-red-600 mb-4" />
            <h3 className="text-xl font-bold mb-3">الكشف عن التهديدات</h3>
            <p className="text-gray-700 text-sm">
              أنظمة ذكية لكشف محاولات الاختراق والأنشطة المريبة. تنبيهات فورية عند
              رصد أي تهديد.
            </p>
          </Card>

          <Card className="p-6">
            <Shield className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-3">التحديثات الأمنية</h3>
            <p className="text-gray-700 text-sm">
              تحديثات أمنية منتظمة وفورية. اختبار ثغرات أمنية دوري بواسطة متخصصين.
            </p>
          </Card>
        </div>

        {/* Best Practices */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            أفضل الممارسات الأمنية
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">1. كلمة المرور القوية</h3>
              <p className="text-gray-700">
                استخدم كلمة مرور قوية تتضمن أحروف كبيرة وصغيرة وأرقام ورموز خاصة.
                لا تشارك كلمة المرور مع أحد.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                2. المصادقة الثنائية
              </h3>
              <p className="text-gray-700">
                فعّل المصادقة الثنائية لإضافة طبقة أمان إضافية. قد يتطلب هذا إدخال
                رمز من تطبيق أو بريد إلكتروني.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">3. الاتصالات الآمنة</h3>
              <p className="text-gray-700">
                لا تستخدم شبكات WiFi عامة غير محمية. استخدم VPN عند الاتصال من شبكات
                عامة.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                4. تحديثات النظام
              </h3>
              <p className="text-gray-700">
                حافظ على جهازك والمتصفح محدثة بأحدث التحديثات الأمنية.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                5. الحذر من الخداع
              </h3>
              <p className="text-gray-700">
                لا تنقر على روابط مريبة أو تحمل ملفات من مصادر غير موثوقة. تحقق من
                عناوين البريد الإلكتروني بعناية.
              </p>
            </div>
          </div>
        </Card>

        {/* Incident Response */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            خطة الاستجابة للحوادث
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            في حالة اكتشاف خرق أمني أو حادث أمني، لدينا خطة استجابة موثقة:
          </p>
          <ol className="space-y-2 text-gray-700">
            <li>1. التحقق الفوري من الحادثة وتقييم شدتها</li>
            <li>2. عزل الأنظمة المتأثرة لمنع المزيد من الأضرار</li>
            <li>3. إخطار العملاء المتأثرين في أسرع وقت</li>
            <li>4. التعاون مع السلطات والجهات المختصة</li>
            <li>5. تحليل شامل وتحسين الأمان منع الحوادث المستقبلية</li>
          </ol>
        </Card>

        {/* Compliance */}
        <Card className="p-8 bg-purple-50">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            الامتثال بالمعايير الدولية
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            نلتزم بأعلى معايير الأمان والخصوصية الدولية:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>✓ GDPR - الامتثال بلوائح حماية البيانات الأوروبية</li>
            <li>✓ ISO 27001 - معايير أمان المعلومات الدولية</li>
            <li>✓ PCI DSS - معايير أمان بطاقات الدفع</li>
            <li>✓ OWASP - أفضل ممارسات أمان التطبيقات</li>
          </ul>
        </Card>
      </section>
    </Layout>
  );
}
