/**
 * Cart Page - View and manage shopping cart
 * Route: /cart
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    totalItems,
    totalPrice,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Le panier est vide");
      return;
    }

    if (!user) {
      toast.error("Veuillez vous connecter pour commander");
      navigate("/login");
      return;
    }

    setIsCheckingOut(true);
    // Navigate to order form
    navigate("/order");
  };

  if (isLoading) {
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <ShoppingBag className="w-8 h-8 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Panier d'achat
            </h1>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="container mx-auto px-4 py-12">
        {items.length === 0 ? (
          // Empty Cart
          <Card className="p-12 text-center bg-gray-50 border-gray-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Panier vide
            </h2>
            <p className="text-gray-600 mb-8">
              Vous n'avez pas encore ajouté de produits. Commencez vos achats!
            </p>
            <Button
              onClick={() => navigate("/")}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              Continuer le shopping
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Articles ({totalItems})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Êtes-vous sûr de vouloir vider le panier?")) {
                      clearCart();
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Vider le panier
                </Button>
              </div>

              {items.map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Image */}
                    {item.imageUrl && (
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/96x96?text=No+Image";
                          }}
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 line-clamp-2">
                            {item.productName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.variantSize} • {item.patternName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">
                          {item.price.toFixed(2)} MAD
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <p className="text-sm text-gray-600 text-right mt-2">
                        Sous-total: {(item.price * item.quantity).toFixed(2)} MAD
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Summary Card */}
              <Card className="p-6 sticky top-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Résumé de commande
                </h2>

                <div className="space-y-3 mb-6 pb-6 border-b-2 border-blue-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Sous-total ({totalItems} articles)</span>
                    <span className="font-semibold">{totalPrice.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Livraison</span>
                    <span className="font-semibold text-green-600">Gratuite</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {totalPrice.toFixed(2)} MAD
                  </span>
                </div>

                {/* Auth Warning */}
                {!user && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        Connexion requise
                      </p>
                      <p className="text-xs text-yellow-700">
                        Connectez-vous pour confirmer votre commande
                      </p>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  size="lg"
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white mb-3"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {isCheckingOut ? "Traitement..." : "Passer la commande"}
                </Button>

                {/* Continue Shopping Button */}
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  size="lg"
                  className="w-full"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Continuer le shopping
                </Button>
              </Card>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
