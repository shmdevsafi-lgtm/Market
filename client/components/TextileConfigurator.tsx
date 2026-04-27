import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TextileConfiguration } from "@/types";

interface TextileConfiguratorProps {
  onConfigChange: (config: TextileConfiguration) => void;
  onImageSelect?: (imageUrl: string) => void;
  basePrice: number;
}

// Price adjustments by configuration
const PRICE_ADJUSTMENTS = {
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

const AVAILABLE_COLORS = [
  { name: "Noir", value: "#000000" },
  { name: "Blanc", value: "#FFFFFF" },
  { name: "Bleu", value: "#0066CC" },
  { name: "Rouge", value: "#CC0000" },
  { name: "Vert", value: "#009900" },
  { name: "Jaune", value: "#FFCC00" },
  { name: "Gris", value: "#666666" },
  { name: "Marron", value: "#8B4513" },
];

export default function TextileConfigurator({
  onConfigChange,
  onImageSelect,
  basePrice,
}: TextileConfiguratorProps) {
  const [config, setConfig] = useState<TextileConfiguration>({
    type: "tshirt",
    material: "cotton",
    size: "M",
    color: "#000000",
  });

  const [userImage, setUserImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Calculate dynamic price
  const calculatePrice = (newConfig: TextileConfiguration) => {
    const typeAdj = PRICE_ADJUSTMENTS.type[newConfig.type] || 0;
    const materialAdj = PRICE_ADJUSTMENTS.material[newConfig.material] || 0;
    const sizeAdj = PRICE_ADJUSTMENTS.size[newConfig.size] || 0;
    const total = basePrice + typeAdj + materialAdj + sizeAdj;
    return total;
  };

  const handleTypeChange = (newType: TextileConfiguration['type']) => {
    const newConfig = { ...config, type: newType };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleMaterialChange = (newMaterial: TextileConfiguration['material']) => {
    const newConfig = { ...config, material: newMaterial };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleSizeChange = (newSize: TextileConfiguration['size']) => {
    const newConfig = { ...config, size: newSize };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleColorChange = (newColor: string) => {
    const newConfig = { ...config, color: newColor };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5MB");
      return;
    }

    try {
      setUploadProgress(30);

      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setUserImage(imageUrl);
        setUploadProgress(100);

        // Update configuration with image
        const newConfig = { ...config, userImageUrl: imageUrl };
        setConfig(newConfig);
        onConfigChange(newConfig);
        onImageSelect?.(imageUrl);

        // Reset progress after 2 seconds
        setTimeout(() => setUploadProgress(0), 2000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erreur lors du téléchargement de l'image");
      setUploadProgress(0);
    }
  };

  const currentPrice = calculatePrice(config);
  const priceIncrease = currentPrice - basePrice;

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Configurateur Textile</h3>

      {/* Type Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Type de vêtement *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(["tshirt", "hoodie", "sweater", "polo"] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`py-2 px-3 rounded-lg border-2 font-medium transition-all text-sm ${
                config.type === type
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {type === "tshirt"
                ? "T-shirt"
                : type === "hoodie"
                ? "Hoodie"
                : type === "sweater"
                ? "Sweatshirt"
                : "Polo"}
            </button>
          ))}
        </div>
      </div>

      {/* Material Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Matériau *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(["cotton", "silk", "crepe", "polyester"] as const).map((mat) => (
            <button
              key={mat}
              onClick={() => handleMaterialChange(mat)}
              className={`py-2 px-3 rounded-lg border-2 font-medium transition-all text-sm ${
                config.material === mat
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {mat === "cotton"
                ? "Coton"
                : mat === "silk"
                ? "Soie"
                : mat === "crepe"
                ? "Crêpe"
                : "Polyester"}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Taille *
        </label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`py-2 px-3 rounded-lg border-2 font-medium transition-all text-sm ${
                config.size === size
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Couleur *
        </label>
        <div className="flex flex-wrap gap-3">
          {AVAILABLE_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                config.color === color.value
                  ? "border-blue-600 ring-2 ring-blue-300"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: color.value }}
              />
              <span className="text-sm font-medium">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Télécharger votre design
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="text-center space-y-2">
              <div className="text-2xl">📷</div>
              <p className="text-sm font-medium text-gray-700">
                Cliquez ou glissez une image
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG (Max 5MB)
              </p>
            </div>
          </label>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Image Preview */}
        {userImage && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">Aperçu:</p>
            <img
              src={userImage}
              alt="Preview"
              className="w-full max-h-48 object-cover rounded-lg border border-gray-300"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setUserImage(null);
                const newConfig = { ...config, userImageUrl: undefined };
                setConfig(newConfig);
                onConfigChange(newConfig);
              }}
            >
              Retirer l'image
            </Button>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-2 border border-blue-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Prix de base:</span>
          <span className="font-medium">{basePrice.toFixed(2)} MAD</span>
        </div>
        {priceIncrease > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Suppléments:</span>
            <span className="font-medium text-blue-600">
              +{priceIncrease.toFixed(2)} MAD
            </span>
          </div>
        )}
        <div className="border-t border-blue-200 pt-2 flex justify-between">
          <span className="font-semibold text-gray-900">Prix total:</span>
          <span className="text-xl font-bold text-blue-600">
            {currentPrice.toFixed(2)} MAD
          </span>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
        <p className="text-gray-600">
          <span className="font-medium">Configuration:</span> {config.type} • {config.material} • Taille {config.size}
          {userImage && " • Design personnalisé"}
        </p>
      </div>
    </Card>
  );
}
