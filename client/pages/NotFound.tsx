import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-6">404</div>
          <h1 className="text-4xl font-bold mb-4">الصفحة غير موجودة</h1>
          <p className="text-xl text-gray-600 mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8b0000] to-[#4b0082] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
