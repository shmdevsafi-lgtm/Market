/**
 * SizeSelector Component - Select product size/variant
 */

import { Button } from "@/components/ui/button";
import type { Variant } from "@/types";

interface SizeSelectorProps {
  variants: Variant[];
  selectedVariantId?: string;
  onSelect: (variant: Variant) => void;
}

export default function SizeSelector({
  variants,
  selectedVariantId,
  onSelect,
}: SizeSelectorProps) {
  if (!variants || variants.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">Aucune taille disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Sélectionner une taille <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-4 gap-2">
        {variants.map((variant) => (
          <Button
            key={variant.id}
            variant={selectedVariantId === variant.id ? "default" : "outline"}
            onClick={() => onSelect(variant)}
            className="text-sm h-10 font-medium"
          >
            {variant.size}
          </Button>
        ))}
      </div>
      {selectedVariantId && (
        <p className="text-sm text-gray-600">
          Prix sélectionné: {
            variants.find((v) => v.id === selectedVariantId)?.price.toFixed(2)
          } MAD
        </p>
      )}
    </div>
  );
}
