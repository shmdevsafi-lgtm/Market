/**
 * Registration Form Component
 * Handles user registration with full validation
 * Includes password strength indicator and region/ville selection
 */

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { MOROCCO_REGIONS } from "../data/moroccoRegions";
import { usePasswordStrength, getPasswordStrengthColorClass, getProgressBarColorClass } from "../hooks/usePasswordStrength";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";

interface RegistrationFormProps {
  onSuccess?: (token: string, user: any) => void;
  onError?: (error: string) => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  nom: string;
  prenom: string;
  telephone: string;
  region: string;
  ville: string;
  adresse: string;
  age: number | "";
}

interface FormErrors {
  [key: string]: string;
}

export function RegistrationForm({ onSuccess, onError }: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    nom: "",
    prenom: "",
    telephone: "",
    region: "",
    ville: "",
    adresse: "",
    age: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const passwordStrength = usePasswordStrength(formData.password);
  const villeOptions = formData.region
    ? MOROCCO_REGIONS.find((r) => r.id.toString() === formData.region)?.villes || []
    : [];

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    // Name validation
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";

    // Phone validation
    if (!formData.telephone) {
      newErrors.telephone = "Le téléphone est requis";
    } else if (!/^(\+212|06)[0-9]{8}$/.test(formData.telephone.replace(/\s/g, ""))) {
      newErrors.telephone = "Format téléphonique invalide";
    }

    // Region and Ville validation
    if (!formData.region) newErrors.region = "La région est requise";
    if (!formData.ville) newErrors.ville = "La ville est requise";

    // Address validation
    if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est requise";

    // Age validation
    if (formData.age === "") {
      newErrors.age = "L'âge est requis";
    } else if (typeof formData.age === "number") {
      if (formData.age < 0) newErrors.age = "L'âge ne peut pas être négatif";
      if (formData.age < 12) newErrors.age = "Vous devez avoir au moins 12 ans";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? (value ? parseInt(value, 10) : "") : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (name === "region") {
      // Reset ville when region changes
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ville: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          region: MOROCCO_REGIONS.find((r) => r.id.toString() === formData.region)?.name,
          ville: formData.ville,
          adresse: formData.adresse,
          age: formData.age,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data.error || "Erreur lors de l'enregistrement";
        onError?.(error);
        setErrors({ submit: error });
        return;
      }

      // Success
      setSuccessMessage("✅ Inscription réussie! Redirection...");
      if (onSuccess && data.token && data.user) {
        setTimeout(() => {
          onSuccess(data.token, data.user);
        }, 1500);
      }
    } catch (error) {
      const message = "Erreur lors de l'enregistrement";
      onError?.(message);
      setErrors({ submit: message });
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Names */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            name="prenom"
            placeholder="Ahmed"
            value={formData.prenom}
            onChange={handleChange}
            disabled={loading}
            className={errors.prenom ? "border-red-500" : ""}
          />
          {errors.prenom && <p className="text-sm text-red-500">{errors.prenom}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            name="nom"
            placeholder="Ali"
            value={formData.nom}
            onChange={handleChange}
            disabled={loading}
            className={errors.nom ? "border-red-500" : ""}
          />
          {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone *</Label>
        <Input
          id="telephone"
          name="telephone"
          placeholder="+212 6XX XXX XXX ou 06XX XXX XXX"
          value={formData.telephone}
          onChange={handleChange}
          disabled={loading}
          className={errors.telephone ? "border-red-500" : ""}
        />
        {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
      </div>

      {/* Region */}
      <div className="space-y-2">
        <Label htmlFor="region">Région *</Label>
        <Select value={formData.region} onValueChange={(value) => handleSelectChange("region", value)} disabled={loading}>
          <SelectTrigger className={errors.region ? "border-red-500" : ""}>
            <SelectValue placeholder="Sélectionnez une région" />
          </SelectTrigger>
          <SelectContent>
            {MOROCCO_REGIONS.map((region) => (
              <SelectItem key={region.id} value={region.id.toString()}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.region && <p className="text-sm text-red-500">{errors.region}</p>}
      </div>

      {/* Ville */}
      <div className="space-y-2">
        <Label htmlFor="ville">Ville *</Label>
        <Select
          value={formData.ville}
          onValueChange={(value) => handleSelectChange("ville", value)}
          disabled={loading || !formData.region}
        >
          <SelectTrigger className={errors.ville ? "border-red-500" : ""}>
            <SelectValue placeholder={formData.region ? "Sélectionnez une ville" : "Sélectionnez d'abord une région"} />
          </SelectTrigger>
          <SelectContent>
            {villeOptions.map((ville) => (
              <SelectItem key={ville} value={ville}>
                {ville}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.ville && <p className="text-sm text-red-500">{errors.ville}</p>}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse (Rue, Bloc, Apt...) *</Label>
        <Input
          id="adresse"
          name="adresse"
          placeholder="Rue X, Bloc Y, Apt 123"
          value={formData.adresse}
          onChange={handleChange}
          disabled={loading}
          className={errors.adresse ? "border-red-500" : ""}
        />
        {errors.adresse && <p className="text-sm text-red-500">{errors.adresse}</p>}
      </div>

      {/* Age */}
      <div className="space-y-2">
        <Label htmlFor="age">Âge *</Label>
        <Input
          id="age"
          name="age"
          type="number"
          min="12"
          max="120"
          placeholder="12 ans ou plus"
          value={formData.age}
          onChange={handleChange}
          disabled={loading}
          className={errors.age ? "border-red-500" : ""}
        />
        {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
        <p className="text-xs text-gray-500">Vous devez avoir au moins 12 ans pour utiliser cette plateforme</p>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe *</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 8 caractères"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className={errors.password ? "border-red-500" : ""}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className={`p-3 rounded border space-y-2 ${getPasswordStrengthColorClass(passwordStrength.color)}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Force du mot de passe</span>
              <span className="text-sm font-semibold">{passwordStrength.label}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressBarColorClass(passwordStrength.color)}`}
                style={{ width: `${passwordStrength.score}%` }}
              />
            </div>
          </div>
        )}

        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Répétez le mot de passe"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            className={errors.confirmPassword ? "border-red-500" : ""}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>

      {/* Error Alert */}
      {errors.submit && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-600">{errors.submit}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Inscription en cours..." : "S'inscrire"}
      </Button>
    </form>
  );
}
