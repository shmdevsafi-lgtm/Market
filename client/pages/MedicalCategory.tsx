/**
 * Medical Category Page
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getCatalogByCategory, CatalogProduct, sortProducts } from '@/services/catalogService';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

export default function MedicalCategory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getCatalogByCategory('medical');
      setProducts(sortProducts(data, 'newest'));
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-12 h-12 animate-spin text-pink-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-pink-600 to-red-600 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-4">المعدات الطبية</h1>
            <p className="text-white/90 text-lg">الصحة والعافية</p>
            <p className="text-white/75">{products.length} produit{products.length !== 1 ? 's' : ''}</p>
          </div>
        </section>

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
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-pink-600 mb-3">
                      {product.price.toFixed(2)} MAD
                    </p>
                    <Button
                      onClick={() => navigate(`/product-detail/${product.id}`)}
                      className="w-full bg-pink-600 hover:bg-pink-700"
                    >
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
