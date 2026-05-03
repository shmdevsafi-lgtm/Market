/**
 * PAGE CATALOGUE HYBRIDE
 * 
 * Affiche produits statiques + dynamiques dans un seul catalogue
 * Architecture: Statique rapide + DB pour nouveautés/scouts
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getCatalog, searchProducts, sortProducts, CatalogProduct } from '@/services/catalogService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Tous les produits' },
  { id: 'shm', label: 'SHM' },
  { id: 'scout-camping', label: 'Scout & Camping' },
  { id: 'medical', label: 'Médical' },
  { id: 'projects', label: 'Projets' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Nouveautés' },
  { id: 'price-asc', label: 'Prix ↑' },
  { id: 'price-desc', label: 'Prix ↓' },
  { id: 'rating', label: 'Note ⭐' },
];

export default function Catalog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);

  // Charger catalogue
  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCatalog();
      setProducts(data);
      applyFilters(data);
    } catch (err) {
      setError('Erreur lors du chargement du catalogue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer filtres
  const applyFilters = async (data: CatalogProduct[] = products) => {
    let result = [...data];

    // Filtre catégorie
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    // Recherche texte
    if (searchQuery) {
      const matches = await searchProducts(searchQuery);
      result = result.filter(p => matches.some(m => m.id === p.id));
    }

    // Filtre prix
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Tri
    result = sortProducts(result, sortBy);

    setFilteredProducts(result);
  };

  // Mettre à jour filtres
  useEffect(() => {
    applyFilters();
    setSearchParams({ category: category !== 'all' ? category : '', q: searchQuery });
  }, [category, searchQuery, sortBy, minPrice, maxPrice]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement du catalogue...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadCatalog}>Réessayer</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-gradient-to-r from-purple-600 to-indigo-700 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-4">Catalogue Produits</h1>
            <p className="text-white/90">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} disponible{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filtres */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                {/* Catégories */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Filter size={18} />
                    Catégories
                  </h3>
                  <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`block w-full text-left px-4 py-2 rounded transition ${
                          category === cat.id
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                <div className="mb-6 border-t pt-6">
                  <h3 className="font-bold text-lg mb-4">Prix</h3>
                  <div className="space-y-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Source produits */}
                <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                  <p className="font-semibold mb-2">📦 Produits disponibles:</p>
                  <p>✓ {products.filter(p => p.isStatic).length} produits officiels SHM</p>
                  <p>✓ {products.filter(p => !p.isStatic).length} produits scouts</p>
                </div>
              </div>
            </aside>

            {/* Contenu Produits */}
            <main className="lg:col-span-3">
              {/* Barre recherche + tri */}
              <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Chercher un produit..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                  {/* Tri */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trier par..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grille produits */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-600 text-lg">Aucun produit trouvé</p>
                  <Button onClick={() => setCategory('all')} variant="outline" className="mt-4">
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                    >
                      {/* Image */}
                      <div className="relative aspect-square bg-gray-200 overflow-hidden">
                        <img
                          src={product.images[0]?.url}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition"
                        />
                        {!product.isStatic && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                            Nouveau
                          </div>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="p-4">
                        {product.isStatic && (
                          <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mb-2 inline-block">
                            Officiel SHM
                          </div>
                        )}
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                        {/* Prix */}
                        <div className="mb-3">
                          <p className="text-2xl font-bold text-purple-600">
                            {product.price.toFixed(2)} MAD
                          </p>
                          {product.discountPrice && (
                            <p className="text-sm text-gray-500 line-through">
                              {product.discountPrice.toFixed(2)} MAD
                            </p>
                          )}
                        </div>

                        {/* Note */}
                        {product.rating && (
                          <div className="text-sm text-gray-600 mb-3">
                            ⭐ {product.rating} ({product.reviewCount} avis)
                          </div>
                        )}

                        {/* Bouton */}
                        <Button
                          onClick={() => navigate(`/product-detail/${product.id}`)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
