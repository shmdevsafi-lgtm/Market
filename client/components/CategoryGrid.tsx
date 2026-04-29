import { Link } from "react-router-dom";

export interface Category {
  id: string;
  label: string;
  icon: string;
  href: string;
  description?: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => {
        // Check if href is external (starts with http/https)
        const isExternal = category.href.startsWith('http');

        const cardContent = (
          <>
            <div className="text-4xl mb-3 transition-transform group-hover:scale-125">
              {category.icon}
            </div>
            <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2">
              {category.label}
            </h3>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </>
        );

        if (isExternal) {
          return (
            <a
              key={category.id}
              href={category.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group shm-glow bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
              {cardContent}
            </a>
          );
        }

        return (
          <Link
            key={category.id}
            to={category.href}
            className="group shm-glow bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {cardContent}
          </Link>
        );
      })}
    </div>
  );
}
