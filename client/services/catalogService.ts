/**
 * CATALOG SERVICE - Architecture Hybride
 * 
 * Fusionne produits statiques (locaux) + dynamiques (Supabase)
 * Optimise performance et DB queries
 */

import { supabase } from '@/lib/supabase';
import { STATIC_PRODUCTS, StaticProduct } from '@/data/staticProducts';

export interface CatalogProduct extends StaticProduct {
  isDynamic?: boolean; // Flag pour identifier source
}

/**
 * Charger catalogue complet (statique + dynamique)
 * 
 * @param category - Catégorie optionnelle pour filtrer
 * @returns Fusion complète des produits
 */
export async function getCatalog(category?: string): Promise<CatalogProduct[]> {
  try {
    // 1. Charger produits statiques
    let staticProducts = [...STATIC_PRODUCTS];
    if (category) {
      staticProducts = staticProducts.filter(p => p.category === category);
    }

    // 2. Charger produits dynamiques depuis Supabase
    let dynamicProducts: CatalogProduct[] = [];
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'published');

      if (error) {
        console.warn('⚠️ Erreur chargement produits dynamiques:', error);
        // Continuer sans produits dynamiques
      } else if (data) {
        dynamicProducts = data.map(p => ({
          ...p,
          isDynamic: true,
          isStatic: false,
        }));

        // Filtrer par catégorie si spécifiée
        if (category) {
          dynamicProducts = dynamicProducts.filter(p => p.category === category);
        }
      }
    } catch (err) {
      console.warn('⚠️ Erreur connexion Supabase:', err);
      // Continuer sans produits dynamiques
    }

    // 3. Fusionner et trier
    const merged = [...staticProducts, ...dynamicProducts];
    
    // Trier par date (nouveautés en premier)
    merged.sort((a, b) => {
      const aNew = a.isStatic ? 0 : 1;
      const bNew = b.isStatic ? 0 : 1;
      return aNew - bNew;
    });

    return merged;
  } catch (error) {
    console.error('❌ Erreur catalogue:', error);
    // Retourner au minimum les produits statiques
    return STATIC_PRODUCTS;
  }
}

/**
 * Charger catalogue par catégorie
 */
export async function getCatalogByCategory(category: string): Promise<CatalogProduct[]> {
  return getCatalog(category);
}

/**
 * Charger produit par ID (statique OU dynamique)
 */
export async function getProductById(id: string): Promise<CatalogProduct | null> {
  // 1. Chercher dans statiques d'abord (plus rapide)
  const staticProduct = STATIC_PRODUCTS.find(p => p.id === id);
  if (staticProduct) {
    return staticProduct;
  }

  // 2. Chercher dans dynamiques
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn('⚠️ Produit non trouvé:', error);
      return null;
    }

    return {
      ...data,
      isDynamic: true,
      isStatic: false,
    } as CatalogProduct;
  } catch (err) {
    console.error('❌ Erreur fetch produit:', err);
    return null;
  }
}

/**
 * Chercher produits par texte
 */
export async function searchProducts(query: string): Promise<CatalogProduct[]> {
  const lowerQuery = query.toLowerCase();

  // Chercher dans statiques
  const staticResults = STATIC_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.slug.includes(lowerQuery)
  );

  // Chercher dans dynamiques
  let dynamicResults: CatalogProduct[] = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    if (!error && data) {
      dynamicResults = data.map(p => ({
        ...p,
        isDynamic: true,
        isStatic: false,
      }));
    }
  } catch (err) {
    console.warn('⚠️ Erreur recherche dynamique:', err);
  }

  return [...staticResults, ...dynamicResults];
}

/**
 * Statistiques catalogue
 */
export async function getCatalogStats(): Promise<{
  staticCount: number;
  dynamicCount: number;
  totalCount: number;
}> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    return {
      staticCount: STATIC_PRODUCTS.length,
      dynamicCount: count || 0,
      totalCount: STATIC_PRODUCTS.length + (count || 0),
    };
  } catch (err) {
    console.error('❌ Erreur stats:', err);
    return {
      staticCount: STATIC_PRODUCTS.length,
      dynamicCount: 0,
      totalCount: STATIC_PRODUCTS.length,
    };
  }
}

/**
 * Filtrer par prix
 */
export async function filterByPrice(
  minPrice: number,
  maxPrice: number,
  category?: string
): Promise<CatalogProduct[]> {
  const products = await getCatalog(category);
  return products.filter(p => p.price >= minPrice && p.price <= maxPrice);
}

/**
 * Trier produits
 */
export function sortProducts(
  products: CatalogProduct[],
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest'
): CatalogProduct[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'newest':
      return sorted.sort((a, b) => {
        const aNew = a.isStatic ? 0 : 1;
        const bNew = b.isStatic ? 0 : 1;
        return aNew - bNew;
      });
    default:
      return sorted;
  }
}
