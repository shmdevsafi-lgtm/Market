/**
 * Order Form Page - Checkout and payment
 * Route: /order
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AlertCircle, ShoppingCart, Lock, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import PayPalButton from "@/components/PayPalButton";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/services/orderService";
import type { Order } from "@/types";

// Validation schema
const OrderFormSchema = z.object({
  customerName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  customerEmail: z.string().email("Email invalide"),
  customerPhone: z.string().min(9, "Téléphone invalide"),
  customerAddress: z.string().min(5, "Adresse invalide"),
  customerCity: z.string().optional(),
});

type OrderFormData = z.infer<typeof OrderFormSchema>;

export default function OrderForm() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, userProfile, loading } = useAuth();

  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerCity: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Check if user is logged in - if not, redirect to login
  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If not logged in AND cart has items, redirect to login
    if (!user && !userProfile && items.length > 0) {
      toast.error("Veuillez vous connecter pour passer une commande");
      navigate("/auth");
      return;
    }
  }, [loading, user, userProfile, items, navigate]);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user && userProfile) {
      setFormData((prev) => ({
        ...prev,
        customerName: userProfile.nom || userProfile.email || "",
        customerEmail: user.email || "",
        customerPhone: userProfile.telephone || "",
      }));
    }
  }, [user, userProfile]);

  // Redirect to cart if no items
  if (items.length === 0 && !orderId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center bg-gray-50">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Panier vide
            </h2>
            <p className="text-gray-600 mb-6">
              Ajoutez des produits avant de passer une commande
            </p>
            <Button
              onClick={() => navigate("/")}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continuer le shopping
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      OrderFormSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    // Check if user is logged in
    if (!user && !userProfile) {
      toast.error("Veuillez vous connecter pour commander");
      navigate("/auth");
      return;
    }

    setPaymentStep(true);
  };

  const handlePaymentSuccess = async (paypalOrderId: string) => {
    try {
      setIsSubmitting(true);

      console.log("💳 Payment successful! PayPal Order ID:", paypalOrderId);
      console.log("📝 Creating order in database...");

      // VERIFICATION: Log the PayPal orderID
      console.log("✅ Received real PayPal Order ID from Smart Buttons:", paypalOrderId);

      // REAL: Call backend to create order in Supabase + capture payment + send notifications
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id || null,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            variantId: item.variantId,
            variantSize: item.variantSize,
            patternId: item.patternId,
            patternName: item.patternName,
            quantity: item.quantity,
            price: item.price,
          })),
          total: totalPrice,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
          customerCity: formData.customerCity,
          paypalOrderId,
        }),
      });

      console.log("📡 Network request to /api/orders - check Network tab");

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error("❌ Order creation failed:", errorData);
        toast.error("Erreur lors de la création de la commande");
        return;
      }

      const orderResult = await orderResponse.json();
      const createdOrderId = orderResult.orderId;

      console.log("✅ Order created successfully in Supabase!");
      console.log("Order ID:", createdOrderId);
      console.log("Full response:", JSON.stringify(orderResult, null, 2));

      // VERIFICATION: Check that order exists
      if (!createdOrderId) {
        console.error("❌ CRITICAL: No order ID returned!");
        toast.error("Erreur: Commande sans ID");
        return;
      }

      setOrderId(createdOrderId);
      clearCart();
      toast.success("✅ Commande créée avec succès!");

      console.log("📤 Order notifications being sent to WhatsApp...");

      // Redirect to confirmation after 2 seconds
      setTimeout(() => {
        navigate(`/order-confirmation/${createdOrderId}`);
      }, 2000);
    } catch (err) {
      console.error("❌ Error creating order:", err);
      console.error("Error details:", String(err));
      toast.error("Erreur lors de la création de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Erreur de paiement: ${error}`);
    setPaymentStep(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Finaliser la commande
              </h1>

              {!paymentStep ? (
                <form onSubmit={handleProceedToPayment} className="space-y-6">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Informations personnelles
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.customerName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Votre nom complet"
                      />
                      {formErrors.customerName && (
                        <p className="text-red-600 text-sm mt-1">
                          {formErrors.customerName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.customerEmail ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="votre.email@example.com"
                      />
                      {formErrors.customerEmail && (
                        <p className="text-red-600 text-sm mt-1">
                          {formErrors.customerEmail}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.customerPhone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="+212 6XX XXX XXX"
                      />
                      {formErrors.customerPhone && (
                        <p className="text-red-600 text-sm mt-1">
                          {formErrors.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Adresse de livraison
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.customerAddress ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Numéro, rue, avenue..."
                      />
                      {formErrors.customerAddress && (
                        <p className="text-red-600 text-sm mt-1">
                          {formErrors.customerAddress}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville/Région
                      </label>
                      <input
                        type="text"
                        name="customerCity"
                        value={formData.customerCity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Casablanca"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <Lock className="h-5 w-5" />
                    Procéder au paiement
                  </Button>
                </form>
              ) : (
                /* Payment Section */
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Confirmez vos informations et complétez le paiement via PayPal
                    </p>
                  </div>

                  <div className="space-y-2 pb-6 border-b">
                    <p className="text-sm text-gray-600">
                      <strong>Nom:</strong> {formData.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {formData.customerEmail}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Téléphone:</strong> {formData.customerPhone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Adresse:</strong> {formData.customerAddress}
                    </p>
                  </div>

                  <PayPalButton
                    amount={totalPrice}
                    description={`Commande - ${items.length} article(s)`}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />

                  <Button
                    variant="outline"
                    onClick={() => setPaymentStep(false)}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Retour au formulaire
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4 bg-gradient-to-br from-gray-50 to-blue-50">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Résumé de la commande
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.productName} <br />
                      <span className="text-xs text-gray-500">
                        {item.variantSize} • {item.patternName}
                      </span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {(item.price * item.quantity).toFixed(2)} MAD
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total</span>
                  <span className="font-semibold">{totalPrice.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Livraison</span>
                  <span className="font-semibold text-green-600">Gratuite</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t-2">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {totalPrice.toFixed(2)} MAD
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
