import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = "shm_favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize favorites from localStorage or Supabase
  useEffect(() => {
    const initializeFavorites = async () => {
      try {
        if (user) {
          // Load from Supabase for authenticated users (using correct 'user_favorites' table)
          const { data, error } = await supabase
            .from("user_favorites")
            .select("product_id")
            .eq("user_id", user.id);

          if (error) {
            console.error("Error loading favorites from Supabase:", error);
            // Fallback to localStorage
            const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
            if (saved) {
              setFavorites(JSON.parse(saved));
            }
          } else {
            const productIds = (data || []).map((item: any) => item.product_id);
            setFavorites(productIds);
            // Sync localStorage
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(productIds));
          }
        } else {
          // Load from localStorage for guests
          const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
          if (saved) {
            setFavorites(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error("Error initializing favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFavorites();
  }, [user]);

  const addFavorite = useCallback(
    async (productId: string) => {
      try {
        if (user) {
          // Add to Supabase (using correct 'user_favorites' table)
          const { error } = await supabase.from("user_favorites").insert([
            {
              user_id: user.id,
              product_id: productId,
            },
          ]);

          if (error) {
            console.error("Error adding favorite to Supabase:", error);
            toast.error("Erreur lors de l'ajout aux favoris");
            return;
          }
        }

        // Add to local state and localStorage
        setFavorites((prev) => {
          if (prev.includes(productId)) return prev;
          const updated = [...prev, productId];
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        toast.success("Ajouté aux favoris");
      } catch (error) {
        console.error("Error adding favorite:", error);
        toast.error("Erreur lors de l'ajout aux favoris");
      }
    },
    [user]
  );

  const removeFavorite = useCallback(
    async (productId: string) => {
      try {
        if (user) {
          // Remove from Supabase (using correct 'user_favorites' table)
          const { error } = await supabase
            .from("user_favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);

          if (error) {
            console.error("Error removing favorite from Supabase:", error);
            toast.error("Erreur lors de la suppression du favori");
            return;
          }
        }

        // Remove from local state and localStorage
        setFavorites((prev) => {
          const updated = prev.filter((id) => id !== productId);
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        toast.success("Retiré des favoris");
      } catch (error) {
        console.error("Error removing favorite:", error);
        toast.error("Erreur lors de la suppression du favori");
      }
    },
    [user]
  );

  const isFavorite = useCallback(
    (productId: string) => {
      return favorites.includes(productId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (isFavorite(productId)) {
        await removeFavorite(productId);
      } else {
        await addFavorite(productId);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  const value: FavoritesContextType = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    isLoading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
