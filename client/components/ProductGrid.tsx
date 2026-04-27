import ProductCard, { Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onOrder?: (productName: string) => void;
}

export type { Product };

export default function ProductGrid({ products, onOrder }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          onOrder={onOrder}
        />
      ))}
    </div>
  );
}
