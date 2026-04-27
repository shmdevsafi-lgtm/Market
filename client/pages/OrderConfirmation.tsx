/**
 * Order Confirmation Page
 * Route: /order-confirmation/:orderId
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  Package,
  Printer,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";

interface Order {
  id: string;
  user_id?: string;
  total_price: number;
  city: string;
  address: string;
  payment_method: string;
  status: string;
  paypal_order_id?: string;
  created_at: string;
  notes?: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
}

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError("ID de commande manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        console.log("📦 Chargement de la commande:", orderId);

        // Fetch order data
        const orderResponse = await fetch(
          `/api/orders/${orderId}`
        );

        if (!orderResponse.ok) {
          throw new Error("Commande non trouvée");
        }

        const orderData = await orderResponse.json();
        setOrder(orderData);

        // Fetch order items
        const itemsResponse = await fetch(
          `/api/orders/${orderId}/items`
        );

        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();
          setItems(itemsData);
        }

        console.log("✅ Commande chargée:", orderData);
      } catch (err) {
        console.error("❌ Erreur:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement de la commande"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "En attente", color: "bg-yellow-100 text-yellow-800" };
      case "confirmed":
        return { label: "Confirmée", color: "bg-blue-100 text-blue-800" };
      case "shipped":
        return { label: "Expédiée", color: "bg-purple-100 text-purple-800" };
      case "delivered":
        return { label: "Livrée", color: "bg-green-100 text-green-800" };
      case "cancelled":
        return { label: "Annulée", color: "bg-red-100 text-red-800" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" };
    }
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

  if (error || !order) {
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
                <p className="text-red-700">{error || "Commande non trouvée"}</p>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="mt-4"
                >
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const statusInfo = getStatusLabel(order.status);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commande confirmée!
          </h1>
          <p className="text-gray-600">
            Merci pour votre commande. Vous recevrez bientôt un email de
            confirmation.
          </p>
        </div>

        {/* Order Summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Détails de la commande</h2>

          <div className="space-y-4">
            {/* Order Number & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Numéro de commande</p>
                <p className="font-mono font-bold text-lg">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </div>
              </div>
            </div>

            {/* Dates & Methods */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Méthode de paiement</p>
                <p className="font-medium">
                  {order.payment_method === "paypal"
                    ? "PayPal"
                    : "À la livraison"}
                </p>
              </div>
            </div>

            {/* PayPal Order ID */}
            {order.paypal_order_id && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">ID PayPal</p>
                <p className="font-mono text-sm">{order.paypal_order_id}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Delivery Address */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Adresse de livraison
          </h2>

          <div className="space-y-2 text-gray-700">
            <p className="font-medium">{order.city}</p>
            <p>{order.address}</p>
          </div>
        </Card>

        {/* Order Items */}
        {items.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Articles commandés</h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.product_name || "Produit"}</p>
                    <p className="text-sm text-gray-500">
                      Quantité: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">{item.price.toFixed(2)} MAD</p>
                </div>
              ))}

              {/* Total */}
              <div className="pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">{order.total_price.toFixed(2)} MAD</span>
              </div>
            </div>
          </Card>
        )}

        {/* Notes */}
        {order.notes && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <p className="text-sm font-medium text-blue-900">Notes de commande:</p>
            <p className="text-sm text-blue-800 mt-2">{order.notes}</p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => window.print()}
            size="lg"
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="h-5 w-5" />
            Imprimer la commande
          </Button>

          <Button
            onClick={() => navigate("/")}
            size="lg"
            variant="outline"
            className="w-full"
          >
            Continuer vos achats
          </Button>
        </div>

        {/* Contact Info */}
        <Card className="p-6 mt-8 bg-gray-50">
          <h3 className="font-bold mb-2">Besoin d'aide?</h3>
          <p className="text-sm text-gray-600">
            Consultez votre email pour plus de détails sur votre commande. Si
            vous avez des questions, contactez notre équipe support.
          </p>
        </Card>
      </div>
    </Layout>
  );
}
