import Layout from "@/components/Layout";
import { Home, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProjectsPottery() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl text-white">🏺</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              فن الفخار
            </h1>
          </div>
          <p className="text-white/90 text-lg">
            حرفة الفخار التقليدية والتصاميم الفنية
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto mb-12">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-6">
              <span className="text-3xl">🏺</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">مشروع فن الفخار</h2>
            <p className="text-gray-600 text-lg mb-6">
              نقدم لك أطقم فخار فنية جميلة مصنوعة بعناية فائقة. اكتشف تراثنا
              الثقافي والفني من خلال منتجات خزفية أصلية.
            </p>
          </div>

          {/* External Link */}
          <a
            href="https://atelier-belkhadir-poterie.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            <span>اكتشف متجر الفخار الآن</span>
            <ExternalLink className="w-5 h-5" />
          </a>

          <p className="text-gray-500 text-sm mt-6">
            ستنقل إلى موقع متخصص في الفخار والحرف التقليدية
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-bold mb-2">تصاميم فنية</h3>
            <p className="text-gray-600 text-sm">
              تصاميم فريدة مصنوعة بعناية يدوية
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-3xl mb-3">🏺</div>
            <h3 className="font-bold mb-2">جودة تقليدية</h3>
            <p className="text-gray-600 text-sm">
              مصنوعة من مواد أصلية بطرق تقليدية
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-bold mb-2">منتجات حصرية</h3>
            <p className="text-gray-600 text-sm">
              كل قطعة فخار فريدة ومميزة
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Buttons */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:translate-x-2 transition-transform"
          >
            <span>←</span>
            <span>عودة إلى المشاريع</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>الرئيسية</span>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
