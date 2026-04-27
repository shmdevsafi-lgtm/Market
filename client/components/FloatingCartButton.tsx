import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function FloatingCartButton() {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => navigate("/cart")}
      className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#8b0000] to-[#6b0000] hover:from-[#a00000] hover:to-[#7b0000] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 active:scale-95"
      aria-label="Open shopping cart"
    >
      <div className="relative">
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#8b0000] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </div>
    </button>
  );
}
