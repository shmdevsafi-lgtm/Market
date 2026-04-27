import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  mainImageUrl?: string;
  productName: string;
}

export default function ProductGallery({
  images,
  mainImageUrl,
  productName,
}: ProductGalleryProps) {
  // Sort images: primary first, then by display order
  const sortedImages = [
    ...(images || []).filter((img) => img.is_primary),
    ...(images || []).filter((img) => !img.is_primary).sort((a, b) => a.display_order - b.display_order),
  ];

  const allImages = sortedImages.length > 0 ? sortedImages : [];
  const primaryImage = allImages[0] || { image_url: mainImageUrl };
  const thumbnails = allImages.slice(0, 4);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const currentImage = allImages[selectedIndex] || primaryImage;

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Card className="overflow-hidden bg-gray-100 aspect-square relative group">
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {currentImage?.image_url ? (
            <img
              src={currentImage.image_url}
              alt={(currentImage as any)?.alt_text || productName}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/500x500?text=No+Image";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-500 text-center px-4">
                Image non disponible
              </span>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
      </Card>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                selectedIndex === index
                  ? "border-blue-600 ring-2 ring-blue-300"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <img
                src={image.image_url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/64x64?text=No+Image";
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Controls */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.25))}
          className="flex-1"
        >
          − Zoom
        </Button>
        <div className="flex items-center justify-center text-sm text-gray-600 min-w-12">
          {Math.round(zoomLevel * 100)}%
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
          className="flex-1"
        >
          + Zoom
        </Button>
      </div>
    </div>
  );
}
