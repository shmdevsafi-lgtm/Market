/**
 * SizeSelector Component
 * Affiche tailles seulement si produit textile
 */

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSizeChange: (size: string) => void;
  productName: string;
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
  productName,
}: SizeSelectorProps) {
  // Ne pas afficher si pas de tailles
  if (!sizes || sizes.length === 0) {
    return null;
  }

  // Déterminer si c'est un produit textile
  const isTextile =
    productName.toLowerCase().includes('chemise') ||
    productName.toLowerCase().includes('veste') ||
    productName.toLowerCase().includes('pantalon') ||
    productName.toLowerCase().includes('pull');

  if (!isTextile) {
    return null;
  }

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
      <label className="block">
        <span className="text-lg font-semibold text-gray-900 mb-3 block">
          Taille *
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`py-2 px-3 rounded-lg font-semibold transition ${
                selectedSize === size
                  ? 'bg-purple-600 text-white border-2 border-purple-600'
                  : 'bg-gray-100 text-gray-900 border-2 border-gray-200 hover:border-purple-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </label>

      {!selectedSize && isTextile && (
        <p className="text-sm text-red-600 font-semibold">
          Veuillez sélectionner une taille
        </p>
      )}
    </div>
  );
}
