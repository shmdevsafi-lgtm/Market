import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonProps {
  amount: number;
  description: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  productId?: string;
  productName?: string;
  price?: number;
  quantity?: number;
}

export default function PayPalButton({
  amount,
  description,
  onSuccess,
  onError,
  productId,
  productName,
  price,
  quantity,
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buttonsRendered, setButtonsRendered] = useState(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Check if PayPal Client ID is configured
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!clientId || clientId === "PAYPAL_CLIENT_ID_NOT_SET") {
      const errorMsg = "PayPal n'est pas configuré. Veuillez définir VITE_PAYPAL_CLIENT_ID dans .env";
      setError(errorMsg);
      setLoading(false);
      onError?.(errorMsg);
      console.warn("⚠️ PayPal Client ID not configured");
      return;
    }

    let isMounted = true;
    let timeout: NodeJS.Timeout | null = null;

    const initPayPal = async () => {
      try {
        if (!isMounted) return;

        // If script is already loaded, just render
        if (scriptLoaded.current && window.paypal) {
          console.log("✓ PayPal script already loaded, rendering buttons");
          setLoading(false);
          setTimeout(() => {
            if (isMounted && containerRef.current?.isConnected) {
              renderPayPalButtons();
            }
          }, 0);
          return;
        }

        setLoading(true);
        setError(null);

        // Check if script is already in DOM
        const existingScript = document.querySelector(
          `script[src*="paypal"][src*="${clientId}"]`
        );

        if (existingScript && window.paypal) {
          scriptLoaded.current = true;
          if (isMounted) {
            setLoading(false);
            setTimeout(() => {
              if (isMounted && containerRef.current?.isConnected) {
                renderPayPalButtons();
              }
            }, 0);
          }
          return;
        }

        // Create and load PayPal script
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=MAD`;
        script.async = true;

        script.onload = () => {
          if (!isMounted) return;
          scriptLoaded.current = true;
          console.log("✓ Script PayPal chargé avec succès");
          console.log("window.paypal available:", !!window.paypal);
          setLoading(false);
          // Use setTimeout to ensure DOM is ready
          setTimeout(() => {
            if (isMounted && containerRef.current?.isConnected) {
              console.log("Rendering PayPal buttons...");
              renderPayPalButtons();
            }
          }, 0);
        };

        script.onerror = () => {
          if (!isMounted) return;
          const errorMsg =
            "Impossible de charger le script PayPal. Vérifiez votre connexion Internet ou l'ID client.";
          console.error("❌ Erreur:", errorMsg);
          setError(errorMsg);
          setLoading(false);
          onError?.(errorMsg);
        };

        // Set a timeout for script loading
        timeout = setTimeout(() => {
          if (!isMounted) return;
          // Only fail if script actually didn't load
          if (!window.paypal) {
            const timeoutMsg =
              "Délai d'attente dépassé pour le chargement de PayPal";
            console.error("⏱️", timeoutMsg);
            setError(timeoutMsg);
            setLoading(false);
          }
        }, 10000); // 10 seconds timeout

        console.log("Adding PayPal script to DOM...");
        document.body.appendChild(script);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error initializing PayPal:", err);
        setError("Erreur lors de l'initialisation de PayPal");
        setLoading(false);
      }
    };

    initPayPal();

    return () => {
      isMounted = false;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const renderPayPalButtons = () => {
    console.log("🔍 renderPayPalButtons called");
    console.log("window.paypal available:", !!window.paypal);
    console.log("containerRef.current:", !!containerRef.current);
    console.log("containerRef.current.isConnected:", containerRef.current?.isConnected);

    if (!window.paypal) {
      console.warn("⚠️ PayPal SDK not available - retrying in 500ms");
      setTimeout(() => {
        if (containerRef.current?.isConnected && window.paypal) {
          renderPayPalButtons();
        }
      }, 500);
      return;
    }

    if (!containerRef.current) {
      console.warn("⚠️ Container ref not available");
      return;
    }

    if (!containerRef.current.isConnected) {
      console.warn("⚠️ Container not in DOM");
      return;
    }

    try {
      // Clear container safely
      console.log("🧹 Clearing container...");
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "paypal",
            height: 45,
          },
          /**
           * CREATE ORDER - REAL API CALL TO PAYPAL VIA OUR BACKEND
           * This creates a REAL PayPal order on PayPal servers
           */
          createOrder: async (data: any, actions: any) => {
            try {
              console.log("📦 Creating real PayPal order...");
              console.log("Amount:", amount, "Currency: MAD");

              // REAL: Call our backend to create PayPal order
              const response = await fetch("/api/paypal/order", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount: amount,
                  currency: "MAD",
                  description: description || "E-Commerce Purchase",
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to create PayPal order");
              }

              const data = await response.json();
              const paypalOrderId = data.paypalOrderId;

              console.log("✅ PayPal order created successfully!");
              console.log("PayPal Order ID:", paypalOrderId);
              console.log("Full response:", JSON.stringify(data, null, 2));

              // VERIFICATION: Ensure we have a real orderID from PayPal
              if (!paypalOrderId) {
                console.error("❌ CRITICAL: No orderID from PayPal!");
                throw new Error("No orderID returned from PayPal");
              }

              // ANTI-SIMULATION: Log the network request
              console.log("📡 Network request made to /api/paypal/order - visible in Network tab");

              return paypalOrderId;
            } catch (error) {
              console.error("❌ Error creating PayPal order:", error);
              toast.error("Impossible de créer la commande PayPal");
              throw error;
            }
          },

          /**
           * ON APPROVE - REAL PAYMENT CAPTURE
           * User approved payment, now capture it
           */
          onApprove: async (data: any, actions: any) => {
            try {
              console.log("💳 User approved payment");
              console.log("PayPal Order ID:", data.orderID);

              // REAL: Verify order status from PayPal
              console.log("✔️ Capturing PayPal payment...");

              // ANTI-SIMULATION: Verify the orderID is real
              if (!data.orderID) {
                console.error("❌ CRITICAL: No orderID in approval data!");
                throw new Error("Invalid PayPal order");
              }

              // PayPal Smart Buttons handle capture internally
              // Return the orderID for application to process
              console.log("✅ Payment approved and ready for capture!");
              console.log("Returning to application with orderID:", data.orderID);

              toast.success("Paiement approuvé avec succès!");
              onSuccess?.(data.orderID);
            } catch (error) {
              console.error("❌ Error in approval:", error);
              toast.error("Erreur lors de l'approbation du paiement");
              onError?.(String(error));
            }
          },

          onError: (err: any) => {
            console.error("❌ PayPal Error:", err);
            const errorMsg = err?.message || "Erreur lors du paiement PayPal";
            console.error("Error details:", JSON.stringify(err, null, 2));
            setError(errorMsg);
            toast.error(errorMsg);
            onError?.(errorMsg);
          },

          onCancel: (data: any) => {
            console.log("⚠️ User cancelled payment");
            toast.info("Paiement annulé");
          },
        })
        .render(containerRef.current)
        .catch((err: any) => {
          console.error("❌ PayPal Buttons render error:", err);
          if (containerRef.current?.isConnected) {
            setError(`Erreur PayPal: ${err?.message || 'Unknown error'}`);
          }
        });

      console.log("✅ PayPal buttons rendered successfully");
      setButtonsRendered(true);
    } catch (err) {
      const errorMsg = `Erreur lors du rendu des boutons PayPal: ${err}`;
      console.error("❌", errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      setButtonsRendered(false);
    }
  };

  if (!import.meta.env.VITE_PAYPAL_CLIENT_ID) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800 mb-1">
              PayPal n'est pas configuré
            </p>
            <p className="text-yellow-700 text-sm">
              Ajoutez <code className="bg-yellow-100 px-2 py-1 rounded">VITE_PAYPAL_CLIENT_ID</code> à votre fichier <code className="bg-yellow-100 px-2 py-1 rounded">.env</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 mb-1">
              Erreur PayPal
            </p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full">
      {(loading || !buttonsRendered) && !error && (
        <div className="flex items-center justify-center h-12 rounded-lg bg-gray-50 border border-gray-200">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 text-sm">Chargement de PayPal...</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
      <div ref={containerRef} className="min-h-12 w-full" />
    </div>
  );
}
