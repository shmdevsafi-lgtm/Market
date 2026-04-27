// ============================================================================
// BASE DE DONNÉES PRODUITS - SHM MARKETPLACE
// Note: Les produits sont maintenant stockés dans Supabase
// Ce fichier contient uniquement les définitions de structure
// ============================================================================

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface ProductVariant {
  id: string;
  type: "size" | "color" | "model";
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: "projects";
  subcategory: string;
  price: number;
  discountPrice?: number;
  description: string;
  detailedDescription: string;
  images: ProductImage[];
  availability: boolean;
  variants?: ProductVariant[];
  rating?: number;
  reviewCount?: number;
  isFragile?: boolean;
}

// ============================================================================
// PRODUITS PROJETS
// ============================================================================

export const PROJECTS_PRODUCTS: Product[] = [
  {
    id: "projects-printing-001",
    name: "Services d'Impression Personnalisée",
    slug: "impression-personnalisee",
    category: "projects",
    subcategory: "printing",
    price: 0.99,
    description: "Impression de documents personnalisés",
    detailedDescription:
      "Services d'impression professionnels pour tous vos besoins de personnalisation. Flyers, affiches, cartes de visite, etc.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1633356713697-85b57294b26a?w=800&h=800&fit=crop",
        alt: "Services Impression",
        isPrimary: true,
      },
    ],
    availability: true,
    rating: 4.4,
    reviewCount: 16,
  },
  {
    id: "projects-pottery-001",
    name: "Ateliers de Poterie",
    slug: "ateliers-poterie",
    category: "projects",
    subcategory: "pottery",
    price: 49.99,
    description: "Cours de poterie et céramique",
    detailedDescription:
      "Ateliers créatifs de poterie pour tous les niveaux. Apprenez les techniques traditionelles de céramique.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1565193566173-7ceb3ee3c82b?w=800&h=800&fit=crop",
        alt: "Atelier Poterie",
        isPrimary: true,
      },
    ],
    availability: true,
    rating: 4.6,
    reviewCount: 22,
  },
];

// ============================================================================
// FONCTION UTILITAIRE - OBTENIR PRODUIT PAR ID
// ============================================================================

export function getProductById(id: string): Product | undefined {
  const allProducts = [...PROJECTS_PRODUCTS];
  return allProducts.find((p) => p.id === id);
}

// ============================================================================
// FONCTION UTILITAIRE - OBTENIR PRODUITS PAR CATÉGORIE
// ============================================================================

export function getProductsByCategory(category: string): Product[] {
  const allProducts = [...PROJECTS_PRODUCTS];
  return allProducts.filter((p) => p.category === category);
}
