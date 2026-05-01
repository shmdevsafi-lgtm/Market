/**
 * Packs & Offers Category Page
 */

import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

export default function PacksCategory() {
  const navigate = useNavigate();
  const packs = [
    {
      id: 'pack-1',
      name: 'Pack Scouts Débutant',
      description: 'Kit complet pour débuter en scouting',
      price: 899.99,
      items: ['Tente 2P', 'Sac à dos 40L', 'Lampe LED', 'Gourde'],
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&h=800&fit=crop',
    },
    {
      id: 'pack-2',
      name: 'Pack Camping Aventure',
      description: 'Pour les campeurs expérimentés',
      price: 1499.99,
      items: ['Tente 4P', 'Matelas', 'Oreiller', 'Sac couchage'],
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&h=800&fit=crop',
    },
    {
      id: 'pack-3',
      name: 'Pack Secours Complet',
      description: 'Trousse médicale professionnelle',
      price: 599.99,
      items: ['Trousse secours', 'Oxymètre', 'Thermomètre', 'Tensio'],
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=800&h=800&fit=crop',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-amber-600 to-orange-600 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-4">الحزم والعروض</h1>
            <p className="text-white/90 text-lg">عروض خاصة وحزم متنوعة</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packs.map(pack => (
              <div key={pack.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={pack.image}
                    alt={pack.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
                  <p className="text-gray-600 mb-4">{pack.description}</p>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Contient:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {pack.items.map((item, idx) => (
                        <li key={idx}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-amber-600">{pack.price.toFixed(2)} MAD</span>
                  </div>
                  <Button
                    onClick={() => navigate(`/product-detail/${pack.id}`)}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    Voir détails
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
