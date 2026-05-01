/**
 * Product Detail Page
 * Page produit moderne avec galerie, infos, actions
 * Responsive mobile-first
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductGallery from '@/components/ProductGallery';
import ProductInfo from '@/components/ProductInfo';
import SizeSelector from '@/components/SizeSelector';
import QuantitySelector from '@/components/QuantitySelector';
import FavoritesButton from '@/components/FavoritesButton';
import { getProductById } from '@/services/catalogService';
import { CatalogProduct } from '@/services/catalogService';
import { useCart } from '@/context/CartContext';
import { Loader, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Charger produit
  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductById(id || '');
      if (!data) {
        setError('Produit non trouvé');
        return;
      }
      setProduct(data);
    } catch (err) {
      setError('Erreur lors du chargement du produit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Validation taille si nécessaire
    const isTextile =
      product.name.toLowerCase().includes('chemise') ||
      product.name.toLowerCase().includes('veste') ||
      product.name.toLowerCase().includes('pantalon') ||
      product.name.toLowerCase().includes('pull');

    if (isTextile && !selectedSize) {
      alert('Veuillez sélectionner une taille');
      return;
    }

    setIsAddingToCart(true);

    try {
      // Ajouter au panier
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0]?.url,
        selectedOptions: selectedSize ? { size: selectedSize } : undefined,
      });

      // Réinitialiser
      setQuantity(0);
      setSelectedSize(null);

      // Message succès
      alert(`${product.name} ajouté au panier !`);
    } catch (err) {
      console.error('Erreur ajout panier:', err);
      alert('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
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

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-600 text-xl mb-6">
              {error || 'Produit non trouvé'}
            </p>
            <Button
              onClick={() => navigate('/catalog')}
              variant="outline"
              className="flex items-center gap-2 mx-auto"
            >
              <ArrowLeft size={16} />
              Retour au catalogue
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb / Retour */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
            >
              <ArrowLeft size={18} />
              Retour
            </button>
          </div>
        </div>

        {/* Contenu Principal */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Colonne Gauche: Galerie */}
            <div>
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Colonne Droite: Infos + Actions */}
            <div className="space-y-6">
              {/* Infos Produit */}
              <ProductInfo
                name={product.name}
                description={product.description}
                price={product.price}
                discountPrice={product.discountPrice}
                availability={product.availability}
                rating={product.rating}
                reviewCount={product.reviewCount}
              />

              {/* Sélecteur Tailles (conditionnel) */}
              {product.variants && product.variants.length > 0 && (
                <SizeSelector
                  sizes={
                    product.variants.find((v) => v.type === 'size')?.options ||
                    []
                  }
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  productName={product.name}
                />
              )}

              {/* Actions: Panier + Favoris */}
              <div className="space-y-3 bg-white p-6 rounded-lg border border-gray-200">
                <QuantitySelector
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  onAddToCart={handleAddToCart}
                  isLoading={isAddingToCart}
                />

                {/* Favoris en dessous du panier */}
                <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
                  <span>Ajouter aux favoris :</span>
                  <FavoritesButton
                    productId={product.id}
                    productSlug={product.slug}
                  />
                </div>
              </div>

              {/* Badge Officiel SHM si applicable */}
              {product.isStatic && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <p className="text-purple-700 font-semibold">
                    ✓ Produit officiel SHM
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Description Détaillée */}
        {product.detailedDescription && (
          <div className="bg-white border-t mt-12 py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Description détaillée
              </h2>
              <div className="prose prose-sm max-w-3xl text-gray-700 whitespace-pre-line">
                {product.detailedDescription}
              </div>
            </div>
          </div>
        )}

        {/* Section Produits Similaires (Placeholder) */}
        <div className="bg-gray-50 border-t mt-12 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Produits similaires
            </h2>
            <div className="text-center text-gray-600">
              <p>Produits similaires en cours de chargement...</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
