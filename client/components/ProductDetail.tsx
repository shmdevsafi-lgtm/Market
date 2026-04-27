import { useState } from "react";
import { Plus, Minus, AlertCircle } from "lucide-react";
import type { Product, ProductVariant } from "@/data/products";
import ProductImageGallery from "./ProductImageGallery";
import FavoriteButton from "./FavoriteButton";
import PayPalButton from "./PayPalButton";

interface ProductDetailProps {
  product: Product;
}

interface SelectedVariants {
  [key: string]: string;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariants>(
    product.variants?.reduce((acc, variant) => {
      acc[variant.id] = variant.options[0];
      return acc;
    }, {} as SelectedVariants) || {}
  );

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleVariantChange = (variantId: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantId]: value,
    }));
  };

  const getVariantLabel = (type: "size" | "color" | "model"): string => {
    const labels: Record<string, string> = {
      size: "المقاس",
      color: "اللون",
      model: "الموديل",
    };
    return labels[type] || type;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Image Gallery */}
      <div>
        <ProductImageGallery images={product.images} productName={product.name} />
      </div>

      {/* Product Information */}
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    {product.discountPrice.toFixed(2)} DH
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {product.price.toFixed(2)} DH
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {product.price.toFixed(2)} DH
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2">
          {product.availability ? (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="font-semibold">متوفر</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">غير متوفر حالياً</span>
            </div>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${
                    i < Math.floor(product.rating || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating} ({product.reviewCount} تقييم)
            </span>
          </div>
        )}

        {/* Description */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-gray-700 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Detailed Description */}
        {product.detailedDescription && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              {product.detailedDescription}
            </p>
          </div>
        )}

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {product.variants.map((variant) => (
              <div key={variant.id}>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {getVariantLabel(variant.type)}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleVariantChange(variant.id, option)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedVariants[variant.id] === option
                          ? "border-blue-500 bg-blue-50 text-blue-900"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity Selector */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            الكمية
          </label>
          <div className="flex items-center gap-3 w-fit bg-gray-100 rounded-lg p-2">
            <button
              onClick={handleDecrement}
              disabled={quantity === 1}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={20} className="text-gray-700" />
            </button>
            <span className="w-12 text-center font-semibold text-gray-700 text-lg">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={20} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-6 space-y-3">
          {/* Favorites Button */}
          <FavoriteButton
            productId={product.id}
            productName={product.name}
            className="w-full justify-center"
          />

          {/* PayPal Button */}
          {product.availability && (
            <PayPalButton
              amount={product.discountPrice || product.price}
              description={`${product.name} x${quantity}`}
              productId={product.id}
              productName={product.name}
              price={product.discountPrice || product.price}
              quantity={quantity}
              onSuccess={(orderId) => {
                console.log("Order placed:", orderId);
              }}
              onError={(error) => {
                console.error("Payment error:", error);
              }}
            />
          )}

          {/* Not Available Message */}
          {!product.availability && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 font-semibold">
                المنتج غير متوفر حالياً
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {product.isFragile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              ⚠️ منتج حساس - يتطلب عناية خاصة عند التعامل والشحن
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
