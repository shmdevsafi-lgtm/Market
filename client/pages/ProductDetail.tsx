/**
 * ProductDetail Page - Generic product detail page for all products
 * Route: /product/:id
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import SizeSelector from "@/components/SizeSelector";
import ColorPatternCustomizer from "@/components/ColorPatternCustomizer";
import QuantitySelector from "@/components/QuantitySelector";
import ProductDetailSummary from "@/components/ProductDetailSummary";

import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";

import { getProductById } from "@/services/productService";
import type { Product, ProductDetail as ProductDetailType, Variant, Pattern } from "@/types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Load product from Supabase
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("ID produit manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);

        if (!data) {
          setError("Produit non trouvé");
          setLoading(false);
          return;
        }

        setProduct(data as any);

        // Set default variant and pattern if available
        if ((data as any).variants && (data as any).variants.length > 0) {
          setSelectedVariant((data as any).variants[0]);
        }
        if ((data as any).patterns && (data as any).patterns.length > 0) {
          setSelectedPattern((data as any).patterns[0]);
        }
      } catch (err) {
        console.error("Error loading product:", err);

        // Extract error message
        let errorMessage = "Erreur lors du chargement du produit";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null) {
          const errObj = err as any;
          if (errObj.message) {
            errorMessage = errObj.message;
          }
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) {
      toast.error("Erreur: produit non chargé");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantité invalide");
      return;
    }

    // Create cart item
    // Allow adding to cart even without variants/patterns
    const cartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant?.id || `variant-${product.id}`,
      variantSize: selectedVariant?.size || "Défaut",
      patternId: selectedPattern?.id || "pattern-default",
      patternName: selectedPattern?.name || "Défaut",
      price: selectedVariant?.price || product.price || product.basePrice,
      quantity,
      imageUrl: product.image_url || product.imageUrl,
    };

    // Add to cart context
    addToCart(cartItem);
    toast.success(`${quantity} ${product.name} ajouté(s) au panier!`);
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    await toggleFavorite(product.id);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 bg-red-50 border-red-200">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-red-800 mb-2">
                  Erreur
                </h2>
                <p className="text-red-700">{error || "Produit non trouvé"}</p>
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="mt-4"
                >
                  Retour
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="flex flex-col gap-4">
            <Card className="overflow-hidden bg-gray-100 aspect-square">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x400?text=No+Image";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">Image non disponible</span>
                </div>
              )}
            </Card>

            {/* Favorite Button */}
            <Button
              variant={isFavorite(product.id) ? "default" : "outline"}
              onClick={handleToggleFavorite}
              className="w-full gap-2"
            >
              <Heart className={`h-4 w-4 ${isFavorite(product.id) ? "fill-current" : ""}`} />
              {isFavorite(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
            </Button>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                {product.category}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 mt-2">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-gray-600 mt-4 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {(selectedVariant?.price || product.price || product.basePrice).toFixed(2)} MAD
              </span>
              <span className="text-sm text-gray-500">par unité</span>
            </div>

            {/* Selectors */}
            <div className="space-y-6">
              {/* Size Selector */}
              {product.variants && product.variants.length > 0 && (
                <SizeSelector
                  variants={product.variants as any}
                  selectedVariantId={selectedVariant?.id}
                  onSelect={setSelectedVariant}
                />
              )}

              {/* Pattern Selector */}
              {product.patterns && product.patterns.length > 0 && (
                <ColorPatternCustomizer
                  patterns={product.patterns}
                  selectedPatternId={selectedPattern?.id}
                  onSelect={setSelectedPattern}
                />
              )}

              {/* Quantity Selector */}
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
              />
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              Ajouter au panier
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-12">
          <ProductDetailSummary
            product={product}
            selectedVariant={selectedVariant || undefined}
            selectedPattern={selectedPattern || undefined}
            quantity={quantity}
          />
        </div>
      </div>
    </Layout>
  );
}
