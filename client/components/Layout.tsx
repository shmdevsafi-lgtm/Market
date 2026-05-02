import { Link } from "react-router-dom";
import { Menu, X, LogOut, User, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userProfile, signOut, loading } = useAuth();
  const { items } = useCart();

  // Calculer le nombre total d'articles
  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const navItems = [
    { label: "SHM", href: "/shm" },
    { label: "الكشافة والتخييم", href: "/scout-camping" },
    { label: "المشاريع", href: "/projects" },
    { label: "الحزم", href: "/packs" },
    { label: "الطبية", href: "/medical" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="shm-gradient sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-white text-xl md:text-2xl font-bold">
              SHM
            </div>
            <div className="hidden sm:block text-white text-sm">Marketplace</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-white hover:text-gray-200 transition-colors font-medium text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Cart Icon + User Section */}
          <div className="flex items-center gap-4">
            {/* Cart Icon with Badge */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-white/10 rounded-lg transition-all duration-300 transform hover:scale-110"
              title="Panier"
            >
              <ShoppingCart size={24} className="text-white" />
              {/* Badge Count */}
              {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse hover:animate-bounce">
                  {cartCount > 99 ? '99+' : cartCount}
                </div>
              )}
            </Link>

            {!loading && user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-white font-semibold text-sm">
                    {userProfile?.nom || user.email}
                  </span>
                  {userProfile?.role === "scout" && (
                    <span className="text-yellow-300 text-xs">
                      ✓ عضو في الكشافة
                    </span>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-white hover:text-red-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                  title="Déconnexion"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <User size={18} />
                <span>دخول</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-[#6b0000] border-t border-white/20">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block text-white hover:text-gray-200 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Auth buttons for mobile */}
              <div className="border-t border-white/20 pt-3 mt-3">
                {!loading && user ? (
                  <>
                    <div className="text-white text-sm font-semibold py-2">
                      {userProfile?.nom || user.email}
                      {userProfile?.role === "scout" && (
                        <span className="block text-yellow-300 text-xs">
                          ✓ عضو في الكشافة
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 text-red-300 hover:text-red-200 font-semibold py-2"
                    >
                      <LogOut size={18} />
                      <span>تسجيل الخروج</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-2 text-white hover:text-gray-200 font-semibold py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>دخول</span>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            {/* About Platform */}
            <div>
              <h3 className="text-lg font-bold mb-4">🏢 عن المنصة</h3>
              <p className="text-gray-400 text-sm mb-4">
                منصة متخصصة في المعدات والمشاريع والخدمات الابتكارية
              </p>
              <Link
                to="/about"
                className="text-gray-400 hover:text-white transition-colors text-sm block"
              >
                تفاصيل أكثر →
              </Link>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">🔗 روابط سريعة</h3>
              <div className="space-y-2 text-sm">
                <Link
                  to="/"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ الرئيسية
                </Link>
                <Link
                  to="/shm"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ SHM
                </Link>
                <Link
                  to="/scout-camping"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ الكشافة والتخييم
                </Link>
                <Link
                  to="/projects"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ المشاريع
                </Link>
                <Link
                  to="/medical"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ المعدات الطبية
                </Link>
                <Link
                  to="/packs"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ الحزم والعروض
                </Link>
              </div>
            </div>

            {/* Account Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">👤 حسابي</h3>
              <div className="space-y-2 text-sm">
                <Link
                  to="/auth"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ دخول
                </Link>
                <Link
                  to="/auth"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ إنشاء حساب
                </Link>
                <Link
                  to="/favorites"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ المفضلة
                </Link>
                <Link
                  to="/cart"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ السلة
                </Link>
                <Link
                  to="/donation"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ التبرع
                </Link>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">⚖️ قانوني</h3>
              <div className="space-y-2 text-sm">
                <Link
                  to="/privacy"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ سياسة الخصوصية
                </Link>
                <Link
                  to="/security"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ سياسة الأمان
                </Link>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ الشروط والأحكام
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ❋ سياسة الاسترجاع
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4">📞 التواصل</h3>
              <div className="space-y-3 text-sm">
                <a
                  href="https://wa.me/212675202336"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-green-400 transition-colors"
                >
                  💬 WhatsApp<br />
                  <span className="text-xs">+212 6 75 20 23 36</span>
                </a>
                <a
                  href="mailto:contact@shm.ma"
                  className="block text-gray-400 hover:text-blue-400 transition-colors"
                >
                  📧 البريد الإلكتروني<br />
                  <span className="text-xs">contact@shm.ma</span>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; 2024 SHM Marketplace. جميع الحقوق محفوظة.</p>
            <p className="mt-2 text-xs">
              تم التطوير بـ ❤️ بواسطة فريق SHM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
