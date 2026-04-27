/**
 * Donation Page - Make donations with PayPal
 * Route: /donation
 */

import { useState } from "react";
import { Heart, AlertCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import PayPalButton from "@/components/PayPalButton";

const DONATION_AMOUNTS = [10, 25, 50, 100, 250, 500];
const DONATION_TYPES = [
  { id: "baby", label: "👶 Baby Smile - Aide aux enfants" },
  { id: "hospital", label: "🏥 Hôpital - Soutien médical" },
  { id: "elderly", label: "👴 Personnes âgées - Soins" },
  { id: "homeless", label: "🏘️ Sans abri - Logement & nourriture" },
  { id: "education", label: "📚 Éducation - Bourses d'études" },
  { id: "environment", label: "🌍 Environnement - Projets écologiques" },
  { id: "other", label: "❤️ Autre - Cause générale" },
];

export default function Donation() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("baby");

  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");

  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const finalAmount =
    selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  const donationTypeLabel = DONATION_TYPES.find(
    (t) => t.id === donationType
  )?.label || "";

  const isFormValid =
    donorName && donorEmail && donationType && finalAmount > 0;

  const handleProceed = () => {
    if (!isFormValid) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    if (finalAmount < 1) {
      toast.error("Le montant doit être au moins 1 MAD");
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = (paypalOrderId: string) => {
    setIsProcessing(true);
    
    // Send donation record to backend
    fetch("/api/donation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: finalAmount,
        donationType,
        donorName,
        donorEmail,
        donorPhone,
        paypalOrderId,
      }),
    })
      .then(() => {
        toast.success("Merci pour votre généreux don!");
        // Reset form
        setDonorName("");
        setDonorEmail("");
        setDonorPhone("");
        setSelectedAmount(50);
        setCustomAmount("");
        setShowPayment(false);
      })
      .catch((err) => {
        console.error("Error saving donation:", err);
        toast.warning(
          "Donation enregistrée mais erreur de sauvegarde. Nous vous contacterons bientôt."
        );
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    toast.error(`Erreur de paiement: ${error}`);
    setPaymentError(error);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Faire un don
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Votre générosité aide à soutenir les communautés vulnérables.
            Chaque don, grand ou petit, fait une différence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2 space-y-6">
            {!showPayment && (
              <>
                {/* Amount Selection */}
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Montant du don
                  </h2>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {DONATION_AMOUNTS.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount ? "default" : "outline"}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                        className="text-lg font-semibold h-14"
                      >
                        {amount} MAD
                      </Button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="Autre montant (MAD)"
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                    />
                  </div>

                  {finalAmount > 0 && (
                    <p className="text-center mt-4 text-lg font-bold text-blue-600">
                      Montant: {finalAmount.toFixed(2)} MAD
                    </p>
                  )}
                </Card>

                {/* Donation Type */}
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Type de don
                  </h2>

                  <div className="space-y-2">
                    {DONATION_TYPES.map((type) => (
                      <label
                        key={type.id}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          donationType === type.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="donationType"
                          value={type.id}
                          checked={donationType === type.id}
                          onChange={(e) => setDonationType(e.target.value)}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="ml-3 text-gray-900 font-medium">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </Card>

                {/* Donor Information */}
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Vos informations
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Votre nom"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone (optionnel)
                      </label>
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder="+212 6XX XXX XXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleProceed}
                    size="lg"
                    disabled={!isFormValid || finalAmount < 1}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <Gift className="h-5 w-5" />
                    Procéder au paiement
                  </Button>
                </Card>
              </>
            )}

            {/* Payment Step - PayPal Button kept mounted to prevent unmount issues */}
            {showPayment && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Confirmation du don
                </h2>

                <div className="space-y-4 mb-8 pb-8 border-b-2">
                  <div>
                    <p className="text-sm text-gray-600">Donateur</p>
                    <p className="font-semibold text-gray-900">{donorName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{donorEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type de don</p>
                    <p className="font-semibold text-gray-900">
                      {donationTypeLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Montant</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {finalAmount.toFixed(2)} MAD
                    </p>
                  </div>
                </div>

                {paymentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{paymentError}</p>
                  </div>
                )}

                <PayPalButton
                  amount={finalAmount}
                  description={`Don - ${donationTypeLabel}`}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />

                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPayment(false);
                    setPaymentError(null);
                  }}
                  disabled={isProcessing}
                  className="w-full mt-4"
                >
                  Retour
                </Button>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4 bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <div className="flex gap-3 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Heart className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 text-sm">
                    Votre impact
                  </p>
                  <p className="text-xs text-red-700">
                    100% de votre don soutient directement nos causes
                  </p>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-4">
                Causes supportées
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                {DONATION_TYPES.slice(0, 5).map((type) => (
                  <li key={type.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {type.label.split(" - ")[0].replace(/[👶🏥👴🏘️]/g, "")}
                  </li>
                ))}
              </ul>

              {!showPayment && finalAmount > 0 && (
                <div className="pt-6 border-t-2 border-red-200">
                  <p className="text-sm text-gray-600 mb-2">Montant du don</p>
                  <p className="text-3xl font-bold text-red-600">
                    {finalAmount.toFixed(2)} MAD
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
