import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface FavoriteButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

export default function FavoriteButton({
  productId,
  productName,
  className = "",
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger l'état des favoris au montage
  useEffect(() => {
    loadFavoriteStatus();
  }, [productId, user]);

  const loadFavoriteStatus = async () => {
    if (user) {
      // Vérifier dans la BD
      try {
        const { data, error } = await supabase
          .from("user_favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .limit(1);

        if (!error && data && data.length > 0) {
          setIsFavorite(true);
        } else {
          setIsFavorite(false);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des favoris:", err);
        toast.error("Erreur lors du chargement des favoris");
      }
    } else {
      // Vérifier dans localStorage (pour les invités)
      const favorites = JSON.parse(
        localStorage.getItem("guest_favorites") || "[]"
      );
      setIsFavorite(favorites.includes(productId));
    }
  };

  const toggleFavorite = async () => {
    setLoading(true);

    try {
      if (user) {
        // Utilisateur connecté - Stocker en BD
        if (isFavorite) {
          // Supprimer des favoris
          const { error } = await supabase
            .from("user_favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);

          if (error) throw error;
          setIsFavorite(false);
          toast.success("Retiré des favoris");
        } else {
          // Ajouter aux favoris
          const { error } = await supabase.from("user_favorites").insert([
            {
              user_id: user.id,
              product_id: productId,
            },
          ]);

          if (error) throw error;
          setIsFavorite(true);
          toast.success("Ajouté aux favoris");
        }
      } else {
        // Utilisateur invité - Stocker en localStorage
        const favorites = JSON.parse(
          localStorage.getItem("guest_favorites") || "[]"
        );

        if (isFavorite) {
          // Supprimer des favoris
          const updated = favorites.filter((id: string) => id !== productId);
          localStorage.setItem("guest_favorites", JSON.stringify(updated));
          setIsFavorite(false);
          toast.success("Retiré des favoris");
        } else {
          // Ajouter aux favoris
          if (!favorites.includes(productId)) {
            favorites.push(productId);
            localStorage.setItem("guest_favorites", JSON.stringify(favorites));
          }
          setIsFavorite(true);
          toast.success("Ajouté aux favoris");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la modification des favoris");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isFavorite
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
      />
      {isFavorite ? "En favoris" : "Ajouter aux favoris"}
    </button>
  );
}
