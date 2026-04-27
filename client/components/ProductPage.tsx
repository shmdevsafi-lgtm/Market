import { Link } from "react-router-dom";
import Layout from "./Layout";
import ProductDetail from "./ProductDetail";
import { ChevronRight, Home } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductPageProps {
  product: Product;
  categoryName: string;
  categoryPath: string;
}

export default function ProductPage({
  product,
  categoryName,
  categoryPath,
}: ProductPageProps) {
  return (
    <Layout>
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              to={categoryPath}
              className="hover:text-gray-900 transition-colors"
            >
              {categoryName}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <section className="container mx-auto px-4 py-12">
        <ProductDetail product={product} />

        {/* Related Products Section */}
        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            منتجات ذات صلة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Related products would be shown here */}
            <p className="text-gray-600 col-span-full text-center py-8">
              لا توجد منتجات ذات صلة متاحة حالياً
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center items-center">
          <Link
            to={categoryPath}
            className="inline-flex items-center gap-2 text-[#8b0000] font-semibold hover:translate-x-2 transition-transform"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>العودة إلى {categoryName}</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8b0000] font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>الرئيسية</span>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
