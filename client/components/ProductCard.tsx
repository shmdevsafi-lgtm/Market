import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

interface ProductCardProps extends Product {
  onOrder?: (productName: string) => void;
  price?: number;
  slug?: string;
}

export default function ProductCard({
  id,
  title,
  description,
  image,
  price,
  slug,
}: ProductCardProps) {
  const productLink = `/product/${id}`;

  return (
    <div className="shm-glow bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* Product Image - Link to Product Page */}
      <Link to={productLink} className="aspect-square bg-gray-200 overflow-hidden block">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={productLink}>
          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 hover:text-red-600 transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
          {description}
        </p>

        {/* Price */}
        {price !== undefined && (
          <div className="mb-4">
            <p className="text-lg font-bold text-red-600">{price.toFixed(2)} DH</p>
          </div>
        )}

        {/* Favorites Button */}
        <FavoriteButton
          productId={id}
          productName={title}
          className="w-full justify-center"
        />

        {/* View Details Link */}
        <Link
          to={productLink}
          className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded transition-all duration-200 text-center"
        >
          عرض التفاصيل
        </Link>
      </div>
    </div>
  );
}
