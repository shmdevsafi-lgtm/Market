/**
 * ScrollToTop Component
 * 
 * Composant wrapper qui scroll automatiquement vers le top
 * sur changement de route. Utile si vous préférez un composant
 * plutôt qu'un hook.
 * 
 * Usage:
 * ```tsx
 * <ScrollToTop>
 *   <YourContent />
 * </ScrollToTop>
 * ```
 */

import { useScrollToTop } from '@/hooks/useScrollToTop';

interface ScrollToTopProps {
  children: React.ReactNode;
  smooth?: boolean;
}

export default function ScrollToTop({ children, smooth = false }: ScrollToTopProps) {
  // Le hook fait tout le travail
  // smooth n'est ici que pour documentation
  useScrollToTop();

  return <>{children}</>;
}

/**
 * ScrollToTopButton Component
 * 
 * Bouton flottant pour permettre à l'utilisateur
 * de revenir en haut de la page manuellement
 * 
 * Usage:
 * ```tsx
 * import ScrollToTopButton from '@/components/ScrollToTopButton';
 * 
 * <ScrollToTopButton />
 * ```
 */

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Afficher le bouton seulement après avoir scrollé 300px
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-24 right-6 z-40 rounded-full p-3 bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-300 transform hover:scale-110 animate-in fade-in slide-in-from-bottom-4"
      size="icon"
      title="Retour en haut"
      aria-label="Retour en haut de page"
    >
      <ArrowUp size={24} />
    </Button>
  );
}
