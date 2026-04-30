/**
 * FavoritesButton Component
 * Toggle favoris avec animation cœur
 * Sauvegarde en DB si user connecté
 */

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface FavoritesButtonProps {
  productId: string;
  productSlug: string;
  initialFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export default function FavoritesButton({
  productId,
  productSlug,
  initialFavorite = false,
  onToggle,
}: FavoritesButtonProps) {
  const { userProfile } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async () => {
    setIsAnimating(true);
    const newState = !isFavorite;
    setIsFavorite(newState);

    // Appel API si user connecté
    if (userProfile) {
      try {
        if (newState) {
          // Ajouter aux favoris
          await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, productSlug }),
          });
        } else {
          // Retirer des favoris
          await fetch(`/api/favorites/${productSlug}`, {
            method: 'DELETE',
          });
        }
      } catch (err) {
        console.error('Erreur favoris:', err);
        // Revert state on error
        setIsFavorite(!newState);
      }
    }

    onToggle?.(newState);

    // Fin animation
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-3 rounded-lg border-2 transition transform ${
        isFavorite
          ? 'border-red-500 bg-red-50 text-red-500'
          : 'border-gray-300 bg-white text-gray-400 hover:border-red-300 hover:text-red-500'
      } ${isAnimating ? 'scale-110' : 'scale-100'}`}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        size={24}
        className={isFavorite ? 'fill-current' : ''}
        style={{
          transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </button>
  );
}
