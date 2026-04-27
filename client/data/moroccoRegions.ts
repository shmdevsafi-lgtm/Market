/**
 * Morocco Regions and Cities Data
 * Used for location selection in registration form
 */

export interface Region {
  id: number;
  name: string;
  villes: string[];
}

export const MOROCCO_REGIONS: Region[] = [
  {
    id: 1,
    name: "Tanger-Tétouan-Al Hoceïma",
    villes: ["Tanger", "Tétouan", "Al Hoceïma", "Larache", "Ouezzane"],
  },
  {
    id: 2,
    name: "Fès-Meknès",
    villes: ["Fès", "Meknès", "Ifrane", "Midelt", "Sefrou"],
  },
  {
    id: 3,
    name: "Rabat-Salé-Kénitra",
    villes: ["Rabat", "Salé", "Kénitra", "Témara", "Skhirat"],
  },
  {
    id: 4,
    name: "Casablanca-Settat",
    villes: ["Casablanca", "Settat", "Fez", "Mohammedia", "Ben Slimane"],
  },
  {
    id: 5,
    name: "Marrakech-Safi",
    villes: ["Marrakech", "Safi", "Essaouira", "Chichaoua", "Kelaat Es-Sraghna"],
  },
  {
    id: 6,
    name: "Drâa-Tafilalet",
    villes: ["Errachidia", "Erfoud", "Risani", "Tinghir", "Merzouga"],
  },
  {
    id: 7,
    name: "Souss-Massa",
    villes: ["Agadir", "Inezgane", "Aït Melloul", "Taroudant", "Tiznit"],
  },
  {
    id: 8,
    name: "Béni Mellal-Khénifra",
    villes: ["Béni Mellal", "Khénifra", "Azilal", "Kasba Tadla", "Kasbah Tadla"],
  },
  {
    id: 9,
    name: "Tangier",
    villes: ["Tangier", "Tangier-Méditerranée", "Fnideq", "Castillejos"],
  },
  {
    id: 10,
    name: "Oujda-Angad",
    villes: ["Oujda", "Angad", "Berkane", "Taourirt", "Jerada"],
  },
  {
    id: 11,
    name: "Guelmim-Oued Noun",
    villes: ["Guelmim", "Tan-Tan", "Sidi Ifni", "Assa", "Zag"],
  },
  {
    id: 12,
    name: "Laâyoune-Sakia El Hamra",
    villes: ["Laâyoune", "Smara", "Boujdour", "Es-Semara"],
  },
];

/**
 * Get all regions
 */
export function getRegions(): Region[] {
  return MOROCCO_REGIONS;
}

/**
 * Get a region by ID
 */
export function getRegionById(id: number): Region | undefined {
  return MOROCCO_REGIONS.find((r) => r.id === id);
}

/**
 * Get cities for a specific region
 */
export function getVillesByRegionId(regionId: number): string[] {
  const region = getRegionById(regionId);
  return region?.villes || [];
}

/**
 * Get region name by ID
 */
export function getRegionNameById(id: number): string | undefined {
  return getRegionById(id)?.name;
}

/**
 * Check if a region and ville combination is valid
 */
export function isValidRegionVille(regionId: number, ville: string): boolean {
  const region = getRegionById(regionId);
  if (!region) return false;
  return region.villes.includes(ville);
}
