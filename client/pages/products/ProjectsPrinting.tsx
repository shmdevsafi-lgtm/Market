import ProductPage from "@/components/ProductPage";
import { getProductById } from "@/data/products";

export default function ProjectsPrintingPage() {
  const product = getProductById("projects-printing-001");

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">المنتج غير موجود</p>
      </div>
    );
  }

  return (
    <ProductPage
      product={product}
      categoryName="مشاريع SHM"
      categoryPath="/projects/printing"
    />
  );
}
