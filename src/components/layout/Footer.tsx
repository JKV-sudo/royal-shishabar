import { Link } from "react-router-dom";
import {
  Crown,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Story", href: "/story" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
    services: [
      { name: "Hookah Menu", href: "/menu" },
      { name: "Events", href: "/events" },
      { name: "Private Parties", href: "/parties" },
      { name: "Catering", href: "/catering" },
    ],
    support: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Reservations", href: "/reservations" },
      { name: "Feedback", href: "/feedback" },
    ],
  };

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
  ];

  return (
    <footer className="bg-royal-charcoal-dark text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <Crown className="w-8 h-8 text-royal-gold" />
              <span className="text-2xl font-royal font-bold royal-text-glow">
                Royal Shisha
              </span>
            </div>
            <p className="text-royal-cream-light mb-6 leading-relaxed">
              Experience the ultimate royal hookah lounge in Germany. Premium
              flavors, luxurious atmosphere, and exceptional service.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-royal-cream-light">
                <MapPin className="w-4 h-4 text-royal-gold flex-shrink-0" />
                <span className="text-sm">
                  123 Royal Street, Berlin, Germany
                </span>
              </div>
              <div className="flex items-center space-x-3 text-royal-cream-light">
                <Phone className="w-4 h-4 text-royal-gold flex-shrink-0" />
                <span className="text-sm">+49 30 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3 text-royal-cream-light">
                <Mail className="w-4 h-4 text-royal-gold flex-shrink-0" />
                <span className="text-sm">info@royalshisha.de</span>
              </div>
              <div className="flex items-center space-x-3 text-royal-cream-light">
                <Clock className="w-4 h-4 text-royal-gold flex-shrink-0" />
                <span className="text-sm">Daily: 18:00 - 02:00</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-royal font-semibold text-royal-gold mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-royal-cream-light hover:text-royal-gold transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-royal font-semibold text-royal-gold mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-royal-cream-light hover:text-royal-gold transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-royal font-semibold text-royal-gold mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-royal-cream-light hover:text-royal-gold transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-royal-gold/20">
          <div className="max-w-md">
            <h3 className="text-lg font-royal font-semibold text-royal-gold mb-2">
              Join Our Royal Newsletter
            </h3>
            <p className="text-royal-cream-light text-sm mb-4">
              Stay updated with our latest events, special offers, and royal
              experiences.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-white placeholder-royal-cream-light focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold"
              />
              <button className="px-6 py-2 bg-royal-gold text-royal-charcoal font-medium rounded-royal hover:bg-royal-gold-light transition-colors duration-200 royal-hover-glow">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-royal-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-royal-cream-light text-sm">
              © {currentYear} Royal Shisha. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-royal-charcoal rounded-full flex items-center justify-center text-royal-gold hover:bg-royal-gold hover:text-royal-charcoal transition-all duration-300 royal-hover-glow"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6 text-royal-cream-light text-sm">
              <Link
                to="/privacy"
                className="hover:text-royal-gold transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-royal-gold transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="hover:text-royal-gold transition-colors duration-200"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
