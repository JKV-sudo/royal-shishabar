import { Link } from "react-router-dom";
import RoyalShishaLogo from "../../assets/Logo.jpeg";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  const navLinks = [
    { name: "Startseite", path: "/" },
    { name: "Menü", path: "/menu" },
    { name: "Events", path: "/events" },
    { name: "Kontakt", path: "/contact" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "#" },
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  return (
    <footer className="bg-royal-charcoal-dark text-royal-cream-light royal-gradient-top-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={RoyalShishaLogo}
                alt="Royal Shisha Logo"
                className="h-12 w-12 rounded-full border-2 border-royal-gold"
              />
              <span className="text-2xl font-royal text-white">
                Royal Shisha
              </span>
            </Link>
            <p className="text-sm">
              Erleben Sie die ultimative königliche Hookah-Lounge in
              Deutschland.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="hover:text-royal-gold transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Kontakt</h3>
            <address className="not-italic space-y-2 text-sm">
              <p>Stadtpl. 2, 84478 Waldkraiburg</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:info@royalshisha.de"
                  className="hover:text-royal-gold"
                >
                  info@royalshisha.de
                </a>
              </p>
              <p>
                Tel:{" "}
                <a href="tel:+49123456789" className="hover:text-royal-gold">
                  +49 123 456789
                </a>
              </p>
            </address>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Folgen</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-royal-cream-light hover:text-royal-gold transform hover:scale-110 transition-all duration-200"
                >
                  <social.icon size={24} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-royal-gold/20 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Royal Shisha. Alle Rechte
            vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
