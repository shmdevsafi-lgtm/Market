/**
 * ProductInfo Component
 * Affiche nom, description, prix, disponibilité
 */

interface ProductInfoProps {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  availability: boolean;
  rating?: number;
  reviewCount?: number;
}

export default function ProductInfo({
  name,
  description,
  price,
  discountPrice,
  availability,
  rating,
  reviewCount,
}: ProductInfoProps) {
  return (
    <div className="space-y-4">
      {/* Nom */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{name}</h1>

      {/* Note et avis */}
      {rating && (
        <div className="flex items-center gap-2">
          <div className="flex text-yellow-400">
            {'⭐'.repeat(Math.round(rating))}
          </div>
          <span className="text-gray-600">
            {rating.toFixed(1)} ({reviewCount || 0} avis)
          </span>
        </div>
      )}

      {/* Description courte */}
      <p className="text-gray-600 text-lg leading-relaxed">{description}</p>

      {/* Prix */}
      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-purple-600">
            {price.toFixed(0)} MAD
          </span>
          {discountPrice && (
            <span className="text-lg text-gray-500 line-through">
              {discountPrice.toFixed(0)} MAD
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="pt-2">
          {availability ? (
            <div className="flex items-center gap-2 text-green-600">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span className="font-semibold">En stock</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              <span className="font-semibold">Rupture de stock</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
