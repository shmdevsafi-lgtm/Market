/**
 * QuantitySelector Component
 * Bouton panier dynamique qui se transforme en compteur quantité
 */

import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  maxQuantity?: number;
  isLoading?: boolean;
}

export default function QuantitySelector({
  quantity,
  onQuantityChange,
  onAddToCart,
  maxQuantity = 999,
  isLoading = false,
}: QuantitySelectorProps) {
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  // State 1: Bouton "Ajouter au panier"
  if (quantity === 0) {
    return (
      <Button
        onClick={() => {
          onQuantityChange(1);
        }}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold flex items-center justify-center gap-2 rounded-lg transition"
        disabled={isLoading}
      >
        <ShoppingCart size={20} />
        Ajouter au panier
      </Button>
    );
  }

  // State 2: Compteur quantité + bouton ajouter
  return (
    <div className="space-y-3">
      {/* Compteur */}
      <div className="flex items-center justify-center gap-4 bg-gray-100 rounded-lg p-3">
        <button
          onClick={handleDecrement}
          className="p-2 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
          disabled={quantity <= 1}
        >
          <Minus size={20} className="text-gray-700" />
        </button>
        
        <span className="text-2xl font-bold text-gray-900 w-12 text-center">
          {quantity}
        </span>

        <button
          onClick={handleIncrement}
          className="p-2 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
          disabled={quantity >= maxQuantity}
        >
          <Plus size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Bouton Ajouter */}
      <Button
        onClick={onAddToCart}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold rounded-lg transition"
        disabled={isLoading}
      >
        {isLoading ? 'Ajout en cours...' : `Ajouter ${quantity} au panier`}
      </Button>

      {/* Message stock faible */}
      {quantity > maxQuantity * 0.8 && maxQuantity !== 999 && (
        <p className="text-sm text-orange-600 text-center">
          ⚠️ Stock limité
        </p>
      )}
    </div>
  );
}
