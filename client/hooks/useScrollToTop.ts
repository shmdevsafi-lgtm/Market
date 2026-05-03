/**
 * Hook useScrollToTop
 * 
 * Automatiquement scroll vers le top (0, 0) lors du changement de route
 * Améliore l'UX en évitant que l'utilisateur reste au bas de la page précédente
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollToTop Hook
 * Écoute les changements de route et scroll automatiquement vers le top
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   useScrollToTop();
 *   return <div>...</div>;
 * }
 * ```
 */
export function useScrollToTop(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll vers le top immédiatement
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto', // Instant (pas d'animation) pour meilleure UX
    });
  }, [pathname]); // Re-run à chaque changement d'URL
}

/**
 * Alternative : useScrollToTopSmooth
 * Avec animation smooth (plus lent mais plus joli)
 */
export function useScrollToTopSmooth(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname]);
}

/**
 * Alternative : useScrollToTopWithDelay
 * Avec délai pour attendre que la page soit chargée
 */
export function useScrollToTopWithDelay(delay: number = 100): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [pathname, delay]);
}
