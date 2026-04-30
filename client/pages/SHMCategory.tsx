/**
 * SHM Category Page
 * Affiche tous les produits SHM (statiques + dynamiques)
 */

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getCatalogByCategory, CatalogProduct, sortProducts } from '@/services/catalogService';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

export default function SHMCategory() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getCatalogByCategory('shm');
      setProducts(sortProducts(data, 'newest'));
    } catch (err) {
      console.error('Erreur chargement produits SHM:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-12 h-12 animate-spin text-purple-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-r from-red-600 to-red-700 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-4">SHM</h1>
            <p className="text-white/90 text-lg">الهوية والانتماء</p>
            <p className="text-white/75">{products.length} produit{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}</p>
          </div>
        </section>

        {/* Produits */}
        <div className="container mx-auto px-4 py-12">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">Aucun produit disponible</p>
              <Button variant="outline">Retour à l'accueil</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  <div className="aspect-square bg-gray-200 overflow-hidden">
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

                  <div className="p-4">
                    {product.isStatic && (
                      <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded mb-2 inline-block">
                        Officiel SHM
                      </div>
                    )}
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-red-600 mb-3">
                      {product.price.toFixed(2)} MAD
                    </p>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Voir détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
