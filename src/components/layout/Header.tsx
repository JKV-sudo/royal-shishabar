import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import RoyalShishaLogo from "../../assets/Logo.jpeg";
import {
  Menu,
  X,
  User,
  LogOut,
  Crown,
  ChevronDown,
  Shield,
  ShoppingCart,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useCart } from "../../contexts/CartContext";
import Cart from "../common/Cart";
import toast from "react-hot-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems } = useCart();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Startseite", path: "/" },
    { name: "Menü", path: "/menu" },
    { name: "Events", path: "/events" },
    { name: "Kontakt", path: "/contact" },
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out!");
      setIsUserMenuOpen(false);
    } catch (error: unknown) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
    setIsMenuOpen(false); // Close mobile menu if open
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-royal-charcoal-dark shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0">
            <img
              className="h-10 w-10 md:h-16 md:w-16 rounded-full border border-royal-gold object-cover"
              src={RoyalShishaLogo}
              alt="Royal Shisha Logo"
            />
          </Link>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `royal-nav-link text-lg font-medium transition-all duration-300 hover:text-royal-gold ${
                    isActive ? "text-royal-gold" : "text-royal-cream"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Cart and User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Button */}
            <motion.button
              onClick={handleCartClick}
              className="relative bg-royal-gradient-gold text-royal-charcoal p-3 rounded-lg royal-glow hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5" />

              {/* Item Count Badge */}
              {getTotalItems() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                >
                  {getTotalItems() > 99 ? "99+" : getTotalItems()}
                </motion.div>
              )}
            </motion.button>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-royal-gradient-gold text-royal-charcoal px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 royal-hover-glow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Crown className="w-4 h-4" />
                  <span className="font-medium">
                    {user?.name || "Royal Member"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-royal-charcoal-dark border border-royal-gold/30 rounded-lg shadow-xl royal-glow"
                    >
                      <div className="p-4">
                        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-royal-gold/20">
                          <div className="w-10 h-10 bg-royal-gradient-gold rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-royal-charcoal" />
                          </div>
                          <div>
                            <p className="text-royal-cream font-medium">
                              {user?.name}
                            </p>
                            <p className="text-royal-cream-light text-sm">
                              {user?.email}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-royal-cream-light text-sm">
                            <Crown className="w-4 h-4 text-royal-gold" />
                            <span>Role: {user?.role}</span>
                          </div>

                          {user?.role === "admin" && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-royal-cream hover:text-royal-gold hover:bg-royal-charcoal rounded-md transition-all duration-200"
                            >
                              <Shield className="w-4 h-4" />
                              <span>Admin Panel</span>
                            </Link>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-royal-cream hover:text-royal-gold hover:bg-royal-charcoal rounded-md transition-all duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth" className="btn-royal-outline">
                Royalty beitreten
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Cart Button */}
            <motion.button
              onClick={handleCartClick}
              className="relative bg-royal-gradient-gold text-royal-charcoal p-2 rounded-lg royal-glow hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5" />

              {/* Item Count Badge */}
              {getTotalItems() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {getTotalItems() > 99 ? "99+" : getTotalItems()}
                </motion.div>
              )}
            </motion.button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-royal-gold"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-royal-charcoal-dark border-t border-royal-gold/20"
          >
            <nav className="px-4 py-6 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:text-royal-gold hover:bg-royal-charcoal ${
                      isActive
                        ? "text-royal-gold bg-royal-charcoal royal-glow"
                        : "text-royal-cream"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              {isAuthenticated ? (
                <div className="mt-6 pt-6 border-t border-royal-gold/20 space-y-3">
                  <div className="px-4 py-3 text-royal-cream-light text-sm royal-glass rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-royal-gradient-gold rounded-full flex items-center justify-center">
                        <Crown className="w-4 h-4 text-royal-charcoal" />
                      </div>
                      <div>
                        <p className="font-medium text-royal-cream">
                          {user?.name}
                        </p>
                        <p className="text-xs">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-royal-cream hover:text-royal-gold hover:bg-royal-charcoal rounded-lg transition-all duration-200"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-royal-cream hover:text-royal-gold hover:bg-royal-charcoal rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-royal-gold/20">
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center bg-royal-gradient-gold text-royal-charcoal font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 royal-hover-glow"
                  >
                    Royalty beitreten
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </motion.header>
  );
};

export default Header;
