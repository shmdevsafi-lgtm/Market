/**
 * ProductDetail - Page complète avec personnalisation textile et PayPal réel
 * Route: /product/:id
 * 
 * FONCTIONNALITÉS:
 * - Galerie d'images dynamique depuis Supabase
 * - Configurateur textile (type, matériau, taille, couleur)
 * - Upload d'image utilisateur
 * - Prix dynamique selon configuration
 * - Avis clients (product_reviews)
 * - Paiement PayPal réel avec création de commande
 * - Sauvegarde réelle dans Supabase
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ShoppingCart,
  Heart,
  Star,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import ProductGallery from "@/components/ProductGallery";
import TextileConfigurator from "@/components/TextileConfigurator";
import PayPalButton from "@/components/PayPalButton";

import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";

import { getProductById } from "@/services/productService";
import type {
  ProductDetail as ProductDetailType,
  ProductImage,
  ProductReview,
  TextileConfiguration,
} from "@/types";

export default function ProductDetailFull() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user, userProfile } = useAuth();

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

  const [textileConfig, setTextileConfig] = useState<TextileConfiguration>({
    type: "tshirt",
    material: "cotton",
    size: "M",
    color: "#000000",
  });

  const [quantity, setQuantity] = useState(1);
  const [showPayPal, setShowPayPal] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState(0);

  // Load product and related data from Supabase
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

        console.log("📦 Chargement du produit:", id);

        // Fetch product data (with fallback to mock)
        const productData = await getProductById(id);
        if (!productData) {
          throw new Error(`Produit "${id}" non trouvé`);
        }

        setProduct(productData as any);

        // Load images and reviews from product data if available
        if ((productData as any).images) {
          setImages((productData as any).images);
        }

        if ((productData as any).reviews) {
          setReviews((productData as any).reviews);
        }

        // Set initial dynamic price (handle both static and customizable product types)
        const basePrice = (productData as any).price || (productData as any).base_price || 0;
        setDynamicPrice(basePrice);

        console.log("✅ Produit chargé:", productData);
      } catch (err) {
        console.error("❌ Erreur lors du chargement du produit:", err);

        // Extract detailed error message
        let errorMessage = "Erreur lors du chargement du produit";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null) {
          const errObj = err as any;
          if (errObj.message) {
            errorMessage = errObj.message;
          } else if (errObj.error) {
            errorMessage = errObj.error;
          } else if (errObj.details) {
            errorMessage = errObj.details;
          }
        }

        console.error("❌ Message d'erreur complet:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleConfigChange = (newConfig: TextileConfiguration) => {
    setTextileConfig(newConfig);

    // Recalculate price based on configuration
    if (product) {
      const priceAdjustments = calculatePriceAdjustments(newConfig);
      const newPrice =
        (product.price || product.basePrice) + priceAdjustments;
      setDynamicPrice(newPrice);

      console.log("💰 Prix mis à jour:", {
        base: product.price || product.basePrice,
        adjustments: priceAdjustments,
        total: newPrice,
        config: newConfig,
      });
    }
  };

  const calculatePriceAdjustments = (config: TextileConfiguration) => {
    const adjustments = {
      type: {
        tshirt: 0,
        hoodie: 150,
        sweater: 200,
        polo: 180,
      },
      material: {
        cotton: 0,
        silk: 100,
        crepe: 120,
        polyester: 50,
      },
      size: {
        XS: 0,
        S: 0,
        M: 0,
        L: 0,
        XL: 50,
        XXL: 100,
      },
    };

    const typeAdj = adjustments.type[config.type] || 0;
    const materialAdj = adjustments.material[config.material] || 0;
    const sizeAdj = adjustments.size[config.size] || 0;

    return typeAdj + materialAdj + sizeAdj;
  };

  const handleAddToCart = () => {
    if (!product) {
      toast.error("Erreur: produit non chargé");
      return;
    }

    const cartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      variantId: product.id + "_" + textileConfig.size,
      variantSize: textileConfig.size,
      patternId: "textile",
      patternName: textileConfig.type,
      price: dynamicPrice,
      quantity,
      imageUrl: product.image_url || product.imageUrl,
      textileConfig,
      userImageUrl: textileConfig.userImageUrl,
    };

    addToCart(cartItem);
    toast.success(`${quantity} ${product.name} ajouté(s) au panier`);
  };

  const handleBuyNowWithPayPal = () => {
    if (!product) {
      toast.error("Erreur: produit non chargé");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantité invalide");
      return;
    }

    console.log("🛒 Préparation à la commande via PayPal:", {
      product: product.name,
      quantity,
      price: dynamicPrice,
      totalPrice: dynamicPrice * quantity,
      config: textileConfig,
    });

    setShowPayPal(true);
  };

  const handlePayPalSuccess = async (paypalOrderId: string) => {
    if (!product || !user || !userProfile) {
      toast.error("Données utilisateur manquantes");
      return;
    }

    console.log("✅ Paiement PayPal approuvé:", paypalOrderId);
    console.log("💾 Création de la commande dans Supabase...");

    try {
      // Create order in database
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items: [
            {
              productId: product.id,
              productName: product.name,
              variantId: product.id + "_" + textileConfig.size,
              variantSize: textileConfig.size,
              patternId: "textile",
              patternName: textileConfig.type,
              quantity,
              price: dynamicPrice,
            },
          ],
          total: dynamicPrice * quantity,
          customerName: `${userProfile.nom} ${userProfile.prenom}`,
          customerEmail: user.email,
          customerPhone: userProfile.telephone || "",
          customerAddress: "À confirmer",
          customerCity: userProfile.ville || "",
          paypalOrderId,
          notes: `Configuration: ${textileConfig.type} • ${textileConfig.material} • Taille ${textileConfig.size}${
            textileConfig.userImageUrl ? " • Design personnalisé" : ""
          }`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création de la commande");
      }

      console.log("✅ Commande créée dans Supabase:", result.orderId);

      // Show success
      toast.success("Commande confirmée! Numéro: " + result.orderId);

      // Navigate to order confirmation
      setTimeout(() => {
        navigate(`/order-confirmation/${result.orderId}`);
      }, 2000);
    } catch (err) {
      console.error("❌ Erreur de commande:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de la commande"
      );
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    await toggleFavorite(product.id);
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

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
        {/* Product Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            <ProductGallery
              images={images}
              mainImageUrl={product.image_url || product.imageUrl}
              productName={product.name}
            />

            {/* Favorite Button */}
            <Button
              variant={isFavorite(product.id) ? "default" : "outline"}
              onClick={handleToggleFavorite}
              className="w-full gap-2"
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite(product.id) ? "fill-current" : ""
                }`}
              />
              {isFavorite(product.id)
                ? "Retirer des favoris"
                : "Ajouter aux favoris"}
            </Button>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                Produit personnalisable
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

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(Number(averageRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating} ({reviews.length} avis)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {dynamicPrice.toFixed(2)} MAD
              </div>
              {product.discount_price && (
                <p className="text-sm text-red-600">
                  📉 {Math.round(
                    ((product.price - product.discount_price) /
                      product.price) *
                      100
                  )}
                  % de réduction
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Quantité
              </label>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-200 rounded"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-12 text-center border-0 bg-transparent font-bold"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ShoppingCart className="h-5 w-5" />
                Ajouter au panier
              </Button>

              <Button
                onClick={handleBuyNowWithPayPal}
                size="lg"
                variant="outline"
                className="w-full gap-2"
              >
                <TrendingUp className="h-5 w-5" />
                Acheter maintenant (PayPal)
              </Button>
            </div>
          </div>
        </div>

        {/* Textile Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <TextileConfigurator
              basePrice={product.price || product.basePrice}
              onConfigChange={handleConfigChange}
              onImageSelect={() => {}}
            />
          </div>

          {/* PayPal Integration */}
          {showPayPal && (
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Paiement PayPal</h3>
              <div className="space-y-2 text-sm bg-gray-50 p-3 rounded">
                <p>
                  <span className="font-medium">Produit:</span> {product.name}
                </p>
                <p>
                  <span className="font-medium">Quantité:</span> {quantity}
                </p>
                <p>
                  <span className="font-medium">Prix unitaire:</span>{" "}
                  {dynamicPrice.toFixed(2)} MAD
                </p>
                <div className="border-t border-gray-300 pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {(dynamicPrice * quantity).toFixed(2)} MAD
                  </span>
                </div>
              </div>

              <PayPalButton
                amount={dynamicPrice * quantity}
                description={`${product.name} - ${textileConfig.type}`}
                onSuccess={handlePayPalSuccess}
                onError={(err) => {
                  console.error("❌ Erreur PayPal:", err);
                  toast.error("Erreur lors du paiement PayPal");
                  setShowPayPal(false);
                }}
              />

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPayPal(false)}
              >
                Annuler
              </Button>
            </Card>
          )}
        </div>

        {/* Detailed Description */}
        {product.detailed_description && (
          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">Description détaillée</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product.detailed_description}
            </p>
          </Card>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Avis clients</h2>
            <div className="space-y-4">
              {reviews
                .filter((r) => r.is_active)
                .map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {review.is_verified_purchase && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                          ✓ Achat vérifié
                        </span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
