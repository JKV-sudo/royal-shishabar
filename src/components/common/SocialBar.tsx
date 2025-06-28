import { motion } from "framer-motion";
import { Instagram, Mail, Phone } from "lucide-react";
import { useState } from "react";

const SocialBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const socialLinks = [
    {
      icon: Instagram,
      href: "https://www.instagram.com/royal.waldkraiburg/",
      label: "Instagram",
      color: "from-purple-500 via-pink-500 to-orange-500",
    },

    {
      icon: Mail,
      href: "mailto:Royal.Waldkraiburg@gmail.com",
      label: "Email",
      color: "bg-royal-gold",
    },
    {
      icon: Phone,
      href: "tel:+4915781413767",
      label: "Phone",
      color: "bg-green-600",
    },
  ];

  return (
    <>
      {/* Desktop Social Bar - Fixed Left Side */}
      <div className="hidden lg:flex fixed left-6 top-1/2 transform -translate-y-1/2 z-50">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col space-y-4 royal-glass rounded-2xl p-4 royal-glow"
        >
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 royal-hover-glow ${
                social.color.includes("from-")
                  ? `bg-gradient-to-r ${social.color}`
                  : social.color
              }`}
              title={social.label}
            >
              <social.icon size={20} />
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Mobile Social Bar - Floating Bottom Right */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Social Icons Column */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute bottom-16 right-0 royal-glass rounded-2xl p-3 royal-glow mb-3"
          >
            <div className="flex flex-col space-y-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.7, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 royal-hover-glow ${
                    social.color.includes("from-")
                      ? `bg-gradient-to-r ${social.color}`
                      : social.color
                  }`}
                  title={social.label}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-royal-gradient-gold rounded-full flex items-center justify-center text-royal-charcoal royal-glow royal-hover-glow shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.div
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </motion.div>
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default SocialBar;
