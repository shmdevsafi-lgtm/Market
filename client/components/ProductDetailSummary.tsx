/**
 * ProductDetailSummary Component - Show selected product details summary
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { Product, Variant, Pattern } from "@/types";

interface ProductDetailSummaryProps {
  product: Product;
  selectedVariant?: Variant;
  selectedPattern?: Pattern;
  quantity: number;
}

export default function ProductDetailSummary({
  product,
  selectedVariant,
  selectedPattern,
  quantity,
}: ProductDetailSummaryProps) {
  const itemPrice = selectedVariant?.price || product.basePrice;
  const totalPrice = itemPrice * quantity;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Résumé de commande</h3>

      <div className="space-y-3">
        {/* Product */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">Produit</p>
            <p className="font-semibold text-gray-800">{product.name}</p>
          </div>
        </div>

        {/* Variant */}
        {selectedVariant && (
          <div className="flex justify-between items-center py-2 border-t border-blue-200">
            <div>
              <p className="text-sm font-medium text-gray-600">Taille</p>
              <p className="font-semibold text-gray-800">{selectedVariant.size}</p>
            </div>
            <Badge variant="secondary">{selectedVariant.price.toFixed(2)} MAD</Badge>
          </div>
        )}

        {/* Pattern */}
        {selectedPattern && (
          <div className="flex justify-between items-center py-2 border-t border-blue-200">
            <div>
              <p className="text-sm font-medium text-gray-600">Motif</p>
              <p className="font-semibold text-gray-800">{selectedPattern.name}</p>
            </div>
            <div className="flex gap-1">
              <div
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: selectedPattern.primaryColor }}
              />
              {selectedPattern.secondaryColor && (
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: selectedPattern.secondaryColor }}
                />
              )}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex justify-between items-center py-2 border-t border-blue-200">
          <div>
            <p className="text-sm font-medium text-gray-600">Quantité</p>
            <p className="font-semibold text-gray-800">x{quantity}</p>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t-2 border-blue-300 mt-4">
          <span className="font-bold text-lg text-gray-800">Total</span>
          <span className="text-2xl font-bold text-blue-600">
            {totalPrice.toFixed(2)} MAD
          </span>
        </div>

        {/* Validation status */}
        <div className="mt-4 space-y-1">
          {selectedVariant && (
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <Check className="h-4 w-4" />
              <span>Taille sélectionnée</span>
            </div>
          )}
          {selectedPattern && (
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <Check className="h-4 w-4" />
              <span>Motif sélectionné</span>
            </div>
          )}
          {quantity > 0 && (
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <Check className="h-4 w-4" />
              <span>Quantité définie</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
