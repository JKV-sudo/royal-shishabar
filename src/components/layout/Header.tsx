import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import RoyalShishaLogo from "../../assets/Logo.jpeg";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Startseite", path: "/" },
    { name: "Menü", path: "/menu" },
    { name: "Events", path: "/events" },
    { name: "Kontakt", path: "/contact" },
  ];

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
              className="h-14 w-14 rounded-full border-2 border-royal-gold"
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
                  `text-lg font-medium transition-colors duration-200 hover:text-royal-gold ${
                    isActive ? "text-royal-gold" : "text-royal-cream"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block">
            <Link to="/auth" className="btn-royal-outline">
              Royalty beitreten
            </Link>
          </div>

          <div className="md:hidden">
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
      {isMenuOpen && (
        <motion.div
          className="md:hidden bg-royal-charcoal-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <nav className="px-2 pt-2 pb-4 space-y-1 sm:px-3 text-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:text-royal-gold hover:bg-royal-charcoal ${
                    isActive
                      ? "text-royal-gold bg-royal-charcoal"
                      : "text-royal-cream"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <Link
              to="/auth"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center mt-4 px-3 py-2 rounded-md text-base font-medium text-royal-gold border border-royal-gold hover:bg-royal-gold hover:text-royal-charcoal-dark"
            >
              Royalty beitreten
            </Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
