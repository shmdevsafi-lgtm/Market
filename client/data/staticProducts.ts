/**
 * PRODUITS STATIQUES - ARCHITECTURE HYBRIDE
 * 
 * Ces produits sont PERMANENTS et stockés localement.
 * Ils ne consomment PAS les requêtes Supabase.
 * 
 * Utilisés pour:
 * - Produits "identité officielle" SHM
 * - Stock quasi-permanent
 * - Prix stables
 * - Inutile de requête DB
 * 
 * Structure unifiée avec les produits dynamiques (DB).
 */

export interface StaticProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface StaticProduct {
  id: string;
  name: string;
  slug: string;
  category: 'shm' | 'scout-camping' | 'medical' | 'projects';
  subcategory?: string;
  price: number;
  discountPrice?: number;
  description: string;
  detailedDescription: string;
  images: StaticProductImage[];
  availability: boolean;
  variants?: {
    type: 'size' | 'color' | 'style';
    options: string[];
  }[];
  rating?: number;
  reviewCount?: number;
  isStatic: true; // Flag pour identification
}

// ============================================================
// SECTION 1: SHM - UNIFORME
// ============================================================

/**
 * Chemise SHM Officielle
 * Produit core - toujours disponible
 */
export const CHEMISE_SHM: StaticProduct = {
  id: 'shm-chemise-001',
  slug: 'chemise-shm-officielle',
  name: 'Chemise SHM Officielle',
  category: 'shm',
  subcategory: 'uniforme',
  price: 100,
  description: 'Chemise rouge officielle SHM - uniforme scout',
  detailedDescription: `Chemise rouge officielle SHM.

Caractéristiques:
- Col structuré
- Deux poches poitrine
- Replis épaules pour fixation fourragère
- Coupe adaptée activités scout
- Matière: 65% polyester, 35% coton
- Lavage 40°C

Tailles disponibles: S, M, L, XL, XXL, XXXL`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1598033129519-e34fdfb0147b?w=800&h=800&fit=crop',
      alt: 'Chemise SHM Rouge Officielle',
      isPrimary: true,
    },
    {
      url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
      alt: 'Chemise SHM - Détail Poche',
    },
  ],
  availability: true,
  variants: [
    {
      type: 'size',
      options: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    },
  ],
  rating: 4.8,
  reviewCount: 127,
  isStatic: true,
};

/**
 * منديل SHM (Nidil)
 * Produit core - accessoire uniforme
 */
export const MANDIL_SHM: StaticProduct = {
  id: 'shm-mandil-001',
  slug: 'mandil-shm',
  name: 'منديل',
  category: 'shm',
  subcategory: 'uniforme',
  price: 30,
  description: 'منديل رسمي SHM - إكسسوار الزي الموحد',
  detailedDescription: `منديل رسمي SHM.

الخصائص:
- لون أخضر رسمي
- شعار SHM
- الأبعاد: 80 × 80 سم
- المادة: 100٪ قطن
- يقاوم الغسيل
- الطي التقليدي مشمول`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=800&fit=crop',
      alt: 'منديل SHM أخضر',
      isPrimary: true,
    },
  ],
  availability: true,
  rating: 4.7,
  reviewCount: 89,
  isStatic: true,
};

// ============================================================
// SECTION 1: SHM - ACCESSOIRES
// ============================================================

/**
 * Noeuds Foulard - Collection de 5 produits
 */
export const NOEUD_TRESSE_CUIR: StaticProduct = {
  id: 'shm-noeud-tresse-001',
  slug: 'noeud-foulard-tresse-cuir',
  name: 'Noeud Foulard - Tresse Cuir',
  category: 'shm',
  subcategory: 'accessoires',
  price: 79.99,
  description: 'Noeud foulard en tresse cuir véritable',
  detailedDescription: `Noeud foulard en tresse cuir artisanal.

Caractéristiques:
- Cuir véritable
- Tressage traditionnel
- Fermeture sécurisée
- Durabilité garantie
- Fait main`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
      alt: 'Noeud Foulard Tresse Cuir',
      isPrimary: true,
    },
  ],
  availability: true,
  rating: 4.6,
  reviewCount: 45,
  isStatic: true,
};

export const NOEUD_FORMEL_CLASSIQUE: StaticProduct = {
  id: 'shm-noeud-formel-001',
  slug: 'noeud-foulard-formel-classique',
  name: 'Noeud Foulard - Formel Classique',
  category: 'shm',
  subcategory: 'accessoires',
  price: 49.99,
  description: 'Noeud foulard formel classique',
  detailedDescription: `Noeud foulard de style formel classique.

Caractéristiques:
- Noeud pré-formé
- Fermeture à clip
- Facile à enfiler
- Couleur noir/blanc
- Maintien optimal`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1606925894917-2d4cd5999cd0?w=800&h=800&fit=crop',
      alt: 'Noeud Foulard Formel',
      isPrimary: true,
    },
  ],
  availability: true,
  rating: 4.5,
  reviewCount: 32,
  isStatic: true,
};

export const NOEUD_CUIVRE_LOGO_FLEUR: StaticProduct = {
  id: 'shm-noeud-cuivre-001',
  slug: 'noeud-foulard-cuivre-logo-fleur',
  name: 'Noeud Foulard - Cuivre Logo Fleur SHM',
  category: 'shm',
  subcategory: 'accessoires',
  price: 99.99,
  description: 'Noeud foulard cuivre avec logo fleur SHM',
  detailedDescription: `Noeud foulard premium en cuivre.

Caractéristiques:
- Logo fleur SHM gravé
- Alliage cuivre résistant
- Finition dorée
- Fermeture magnétique
- Prestige officiel`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop',
      alt: 'Noeud Foulard Cuivre Fleur',
      isPrimary: true,
    },
  ],
  availability: true,
  rating: 4.7,
  reviewCount: 56,
  isStatic: true,
};

export const NOEUD_METAL_ARGENTE: StaticProduct = {
  id: 'shm-noeud-metal-001',
  slug: 'noeud-foulard-metal-argente',
  name: 'Noeud Foulard - Métal Argenté',
  category: 'shm',
  subcategory: 'accessoires',
  price: 119.99,
  description: 'Noeud foulard métal argenté premium',
  detailedDescription: `Noeud foulard en alliage argenté.

Caractéristiques:
- Alliage argenté inoxydable
- Finition lisse brillante
- Durabilité maximale
- Fermeture sécurisée
- Aspect professionnel`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
      alt: 'Noeud Foulard Métal Argenté',
      isPrimary: true,
    },
  ],
  availability: true,
  rating: 4.8,
  reviewCount: 73,
  isStatic: true,
};

export const NOEUD_PREMIUM_DORE: StaticProduct = {
  id: 'shm-noeud-dore-001',
  slug: 'noeud-foulard-premium-dore',
  name: 'Noeud Foulard - Premium Doré',
  category: 'shm',
  subcategory: 'accessoires',
  price: 149.99,
  description: 'Noeud foulard premium doré - collection exclusive',
  detailedDescription: `Noeud foulard premium doré - édition limitée.

Caractéristiques:
- Plaqué or 24k
- Gravure personnalisable
- Présentation coffret
- Édition limitée 500 pièces
- Certificat d'authenticité`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop',
      alt: 'Noeud Foulard Premium Doré',
      isPrimary: true,
    },
  ],
  availability: true,
  rating: 4.9,
  reviewCount: 28,
  isStatic: true,
};

// ============================================================
// SECTION 2: SCOUT & CAMPING
// ============================================================

export const TENTE_CAMPING_2P: StaticProduct = {
  id: 'scout-tente-2p-001',
  slug: 'tente-camping-2-personnes',
  name: 'Tente Camping 2 Personnes',
  category: 'scout-camping',
  subcategory: 'tentes',
  price: 299.99,
  description: 'Tente de camping légère 2 personnes',
  detailedDescription: `Tente de camping professionnelle pour 2 personnes.

Caractéristiques:
- Poids: 1.8 kg
- Hauteur: 1.2 m
- Ventilation optimale
- Imperméable 5000mm
- Sac de transport inclus
- Autonomie: 8h sans recharge

Parfaite pour excursions scout.`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&h=800&fit=crop',
      alt: 'Tente Camping 2 Personnes',
      isPrimary: true,
    },
  ],
  availability: true,
  variants: [
    {
      type: 'color',
      options: ['Bleu', 'Vert', 'Gris'],
    },
  ],
  rating: 4.6,
  reviewCount: 94,
  isStatic: true,
};

// ============================================================
// SECTION 3: MÉDICAL
// ============================================================

export const TROUSSE_SECOURS: StaticProduct = {
  id: 'medical-trousse-001',
  slug: 'trousse-premiers-secours',
  name: 'Trousse Premiers Secours Complète',
  category: 'medical',
  subcategory: 'secours',
  price: 149.99,
  description: 'Trousse de premiers secours professionnelle',
  detailedDescription: `Trousse complète de premiers secours.

Contenu:
- Bandages assortis
- Gaze stérile
- Compresses
- Désinfectant
- Antalgiques
- Thermomètre
- Ciseaux médicaux
- Manuel de secours

Usage: Scout, camping, école`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=800&h=800&fit=crop',
      alt: 'Trousse Premiers Secours',
      isPrimary: true,
    },
  ],
  availability: true,
  rating: 4.8,
  reviewCount: 156,
  isStatic: true,
};

// ============================================================
// SECTION 4: PROJETS (SERVICES)
// ============================================================

export const IMPRESSION_PERSONNALISEE: StaticProduct = {
  id: 'projects-impression-001',
  slug: 'impression-personnalisee',
  name: 'Service Impression Personnalisée',
  category: 'projects',
  subcategory: 'printing',
  price: 19.99,
  description: 'Service d\'impression personnalisée pour flyers, cartes, etc.',
  detailedDescription: `Service professionnel d'impression personnalisée.

Services:
- Flyers A4 (100 pièces: 19.99 MAD)
- Cartes de visite (500 pièces: 49.99 MAD)
- Affiches (A3: 29.99 MAD)
- T-shirts (impression textile)
- Bandeaux personnalisés

Délai: 3-5 jours ouvrables`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1633356713697-85b57294b26a?w=800&h=800&fit=crop',
      alt: 'Service Impression',
      isPrimary: true,
    },
  ],
  availability: true,
  rating: 4.4,
  reviewCount: 67,
  isStatic: true,
};

export const ATELIER_POTERIE: StaticProduct = {
  id: 'projects-poterie-001',
  slug: 'atelier-poterie',
  name: 'Atelier Poterie et Céramique',
  category: 'projects',
  subcategory: 'pottery',
  price: 199.99,
  description: 'Cours de poterie - apprentissage traditionnel',
  detailedDescription: `Ateliers créatifs de poterie pour tous les niveaux.

Programme:
- Session 4h: 199.99 MAD
- Session 8h (2 jours): 349.99 MAD
- Matériel fourni
- Cuisson incluse
- Certificat participation

Tous niveaux acceptés`,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1565193566173-7ceb3ee3c82b?w=800&h=800&fit=crop',
      alt: 'Atelier Poterie',
      isPrimary: true,
    },
  ],
  availability: true,
  rating: 4.6,
  reviewCount: 45,
  isStatic: true,
};

// ============================================================
// COLLECTION COMPLÈTE - TOUS LES PRODUITS STATIQUES
// ============================================================

export const STATIC_PRODUCTS: StaticProduct[] = [
  // SHM - Uniforme
  CHEMISE_SHM,
  MANDIL_SHM,

  // SHM - Accessoires
  NOEUD_TRESSE_CUIR,
  NOEUD_FORMEL_CLASSIQUE,
  NOEUD_CUIVRE_LOGO_FLEUR,
  NOEUD_METAL_ARGENTE,
  NOEUD_PREMIUM_DORE,

  // Scout & Camping
  TENTE_CAMPING_2P,

  // Médical
  TROUSSE_SECOURS,

  // Projets
  IMPRESSION_PERSONNALISEE,
  ATELIER_POTERIE,
];

// ============================================================
// UTILITAIRES
// ============================================================

/**
 * Récupérer produit statique par ID
 */
export function getStaticProductById(id: string): StaticProduct | undefined {
  return STATIC_PRODUCTS.find(p => p.id === id);
}

/**
 * Récupérer produits statiques par catégorie
 */
export function getStaticProductsByCategory(category: string): StaticProduct[] {
  return STATIC_PRODUCTS.filter(p => p.category === category);
}

/**
 * Récupérer produits statiques par catégorie + sous-catégorie
 */
export function getStaticProductsBySubcategory(category: string, subcategory: string): StaticProduct[] {
  return STATIC_PRODUCTS.filter(
    p => p.category === category && p.subcategory === subcategory
  );
}
