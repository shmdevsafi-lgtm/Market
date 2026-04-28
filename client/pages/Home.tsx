import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Shield,
  Tent,
  Lightbulb,
  Heart,
  Package,
} from "lucide-react";

export default function Home() {
  const categories = [
    {
      id: 1,
      title: "SHM",
      description: "الهوية والانتماء",
      icon: Shield,
      href: "/shm",
      color: "from-red-600 to-red-700",
    },
    {
      id: 2,
      title: "الكشافة والتخييم",
      description: "معدات الفريق والمغامرة",
      icon: Tent,
      href: "/scout-camping",
      color: "from-green-600 to-teal-700",
    },
    {
      id: 3,
      title: "مشاريع SHM",
      description: "الابتكار والتخصيص",
      icon: Lightbulb,
      href: "/projects",
      color: "from-purple-600 to-indigo-700",
    },
    {
      id: 4,
      title: "المعدات الطبية",
      description: "الصحة والعافية",
      icon: Heart,
      href: "/medical",
      color: "from-pink-600 to-red-600",
    },
    {
      id: 5,
      title: "الحزم والعروض",
      description: "عروض خاصة وحزم متنوعة",
      icon: Package,
      href: "/packs",
      color: "from-amber-600 to-orange-600",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="mb-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-[#8b0000] to-[#4b0082] bg-clip-text text-transparent">
              منصة SHM
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-2">
              المعدات، المشاريع، والابتكار
            </p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              اكتشف مجموعتنا الشاملة من المنتجات والخدمات المصممة خصيصاً لتلبية احتياجاتك
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={category.href}
                className="group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-full rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[rgba(139,0,0,0.4)] transform hover:-translate-y-2 cursor-pointer">
                  {/* Card Background with Gradient */}
                  <div
                    className={`bg-gradient-to-br ${category.color} p-8 h-full flex flex-col justify-between relative overflow-hidden`}
                  >
                    {/* Animated background elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {category.title}
                      </h3>
                      <p className="text-white/90 text-sm md:text-base">
                        {category.description}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <div className="relative z-10 mt-6 inline-flex items-center gap-2 text-white font-semibold group-hover:translate-x-2 transition-transform">
                      <span>اكتشف المزيد</span>
                      <svg
                        className="w-5 h-5 rtl:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Charitable Section */}
      <section className="container mx-auto px-4 py-16 mt-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="text-3xl">❤️</span>
            <span>اعمال خيرية</span>
          </h2>
          <p className="text-gray-600 text-lg">
            ساعدنا في دعم المنظمات الخيرية والمبادرات الإنسانية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Baby Smile Card */}
          <a
            href="https://basmat-radie.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group h-full rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 cursor-pointer"
          >
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 h-full flex flex-col justify-between relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-5xl">👶</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Baby Smile
                </h3>
                <p className="text-white/90 text-base">
                  منظمة مختصة برعاية الأطفال والرضع والدعم الصحي للعائلات المحتاجة
                </p>
              </div>

              {/* Arrow indicator */}
              <div className="relative z-10 mt-6 inline-flex items-center gap-2 text-white font-semibold group-hover:translate-x-2 transition-transform">
                <span>زيارة الموقع</span>
                <svg
                  className="w-5 h-5 rtl:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </a>

          {/* Donation Card */}
          <Link
            to="/donation"
            className="group h-full rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 cursor-pointer"
          >
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 h-full flex flex-col justify-between relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-5xl">💝</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  تبرع الآن
                </h3>
                <p className="text-white/90 text-base">
                  ساهم معنا في مساعدة المحتاجين والمريضين والأطفال من خلال التبرع
                </p>
              </div>

              {/* Arrow indicator */}
              <div className="relative z-10 mt-6 inline-flex items-center gap-2 text-white font-semibold group-hover:translate-x-2 transition-transform">
                <span>تبرع</span>
                <svg
                  className="w-5 h-5 rtl:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* C W Studio Card */}
          <a
            href="https://c-w-studio.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group h-full rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 cursor-pointer"
          >
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-8 h-full flex flex-col justify-between relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-5xl">🎨</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  C W Studio
                </h3>
                <p className="text-white/90 text-base">
                  استوديو متخصص في التصميم والإبداع والحلول البصرية المبتكرة
                </p>
              </div>

              {/* Arrow indicator */}
              <div className="relative z-10 mt-6 inline-flex items-center gap-2 text-white font-semibold group-hover:translate-x-2 transition-transform">
                <span>زيارة الموقع</span>
                <svg
                  className="w-5 h-5 rtl:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 mt-8">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">
            لماذا اختيار منصة SHM؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">جودة عالية</h3>
              <p className="text-gray-600">
                منتجات مختارة بعناية بأعلى معايير الجودة
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-3">تواصل مباشر</h3>
              <p className="text-gray-600">
                تواصل معنا عبر WhatsApp للاستفسارات والطلبات
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">خدمة سريعة</h3>
              <p className="text-gray-600">
                معالجة سريعة للطلبات والتسليم في الوقت المناسب
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
