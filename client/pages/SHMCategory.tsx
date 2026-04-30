/**
 * SHM Category Page
 * Structure: الزي الرسمي الاحمر (Uniforme) + Accessoires
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

  // Séparer uniforme et accessoires
  const uniformeProducts = products.filter(p => p.subcategory === 'uniforme');
  const accessoiresProducts = products.filter(p => p.subcategory === 'accessoires');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-12 h-12 animate-spin text-red-600" />
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

        <div className="container mx-auto px-4 py-12">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">Aucun produit disponible</p>
              <Button variant="outline">Retour à l'accueil</Button>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Section 1: Uniforme */}
              {uniformeProducts.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-red-600">
                    الزي الرسمي الاحمر
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {uniformeProducts.map(product => (
                      <ProductCard key={product.id} product={product} color="red" />
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Accessoires */}
              {accessoiresProducts.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-red-600">
                    Accessoires
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {accessoiresProducts.map(product => (
                      <ProductCard key={product.id} product={product} color="red" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/**
 * Composant réutilisable ProductCard
 */
function ProductCard({ 
  product, 
  color = 'purple' 
}: { 
  product: CatalogProduct; 
  color?: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; btn: string; btnHover: string }> = {
    red: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      btn: 'bg-red-600',
      btnHover: 'hover:bg-red-700',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      btn: 'bg-green-600',
      btnHover: 'hover:bg-green-700',
    },
    pink: {
      bg: 'bg-pink-100',
      text: 'text-pink-700',
      btn: 'bg-pink-600',
      btnHover: 'hover:bg-pink-700',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      btn: 'bg-purple-600',
      btnHover: 'hover:bg-purple-700',
    },
  };

  const colors = colorMap[color] || colorMap.purple;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
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

      <div className="p-4">
        {product.isStatic && (
          <div className={`text-xs ${colors.bg} ${colors.text} px-2 py-1 rounded mb-2 inline-block`}>
            Officiel SHM
          </div>
        )}
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-2xl font-bold mb-3" style={{ color: `var(--color-${color}-600)` }}>
          {product.price.toFixed(0)} MAD
        </p>
        <Button className={`w-full ${colors.btn} ${colors.btnHover}`}>
          Voir détails
        </Button>
      </div>
    </div>
  );
}
