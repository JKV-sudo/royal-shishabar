import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RoyalShishaLogo from "../../assets/Logo.jpeg";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Crown,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

const Footer = () => {
  const navLinks = [
    { name: "Startseite", path: "/" },
    { name: "Menü", path: "/menu" },
    { name: "Events", path: "/events" },
    { name: "Kontakt", path: "/contact" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-royal-charcoal-dark text-royal-cream-light royal-gradient-top-border relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 left-10 w-20 h-20 bg-royal-gold/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-10 right-10 w-24 h-24 bg-royal-purple/10 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src={RoyalShishaLogo}
                  alt="Royal Shisha Logo"
                  className="h-12 w-12 rounded-full border-2 border-royal-gold group-hover:border-royal-gold-light transition-colors duration-300"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full border-2 border-royal-gold/30 royal-glow"
                />
              </div>
              <span className="text-2xl font-royal text-white group-hover:text-royal-gold transition-colors duration-300">
                Royal Shisha
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Erleben Sie die ultimative königliche Hookah-Lounge in Deutschland
              mit Premium-Qualität und exklusivem Service.
            </p>
            <div className="flex items-center space-x-2 text-royal-gold">
              <Crown className="w-4 h-4" />
              <span className="text-xs font-medium">Premium Experience</span>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Crown className="w-4 h-4 mr-2 text-royal-gold" />
              Navigation
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={link.path}
                    className="hover:text-royal-gold transition-all duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-royal-gold transition-all duration-300 mr-2"></span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-royal-gold" />
              Kontakt
            </h3>
            <address className="not-italic space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-royal-gold mt-0.5 flex-shrink-0" />
                <p>Stadtpl. 2, 84478 Waldkraiburg</p>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-royal-gold flex-shrink-0" />
                <a
                  href="mailto:info@royalshisha.de"
                  className="hover:text-royal-gold transition-colors duration-200"
                >
                  info@royalshisha.de
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-royal-gold flex-shrink-0" />
                <a
                  href="tel:+49123456789"
                  className="hover:text-royal-gold transition-colors duration-200"
                >
                  +49 123 456789
                </a>
              </div>
            </address>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Crown className="w-4 h-4 mr-2 text-royal-gold" />
              Folgen Sie uns
            </h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="text-royal-cream-light hover:text-royal-gold transition-all duration-200 p-2 rounded-lg hover:bg-royal-charcoal royal-hover-glow"
                  aria-label={social.label}
                >
                  <social.icon size={24} />
                </motion.a>
              ))}
            </div>
            <div className="mt-4 p-3 bg-royal-charcoal/50 rounded-lg border border-royal-gold/20">
              <p className="text-xs text-royal-cream-light/80">
                Erhalten Sie exklusive Angebote und Event-Updates
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-royal-gold/20 text-center text-sm"
        >
          <p className="text-royal-cream-light/80">
            &copy; {new Date().getFullYear()} Royal Shisha. Alle Rechte
            vorbehalten.
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs text-royal-cream-light/60">
            <a
              href="#"
              className="hover:text-royal-gold transition-colors duration-200"
            >
              Datenschutz
            </a>
            <a
              href="#"
              className="hover:text-royal-gold transition-colors duration-200"
            >
              Impressum
            </a>
            <a
              href="#"
              className="hover:text-royal-gold transition-colors duration-200"
            >
              AGB
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
