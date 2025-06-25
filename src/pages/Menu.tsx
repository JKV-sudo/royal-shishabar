import React from "react";
import { motion } from "framer-motion";
import { Crown, Star, Clock, Users, Sparkles } from "lucide-react";

const Menu: React.FC = () => {
  const categories = [
    {
      name: "Premium Shisha",
      description: "Unsere exklusivsten Aromen",
      items: [
        {
          name: "Royal Gold",
          price: "€25",
          description: "Goldener Tabak mit Vanille und Honig",
          rating: 5,
        },
        {
          name: "Purple Haze",
          price: "€23",
          description: "Traube mit Lavendel und Minze",
          rating: 5,
        },
        {
          name: "Burgundy Dreams",
          price: "€24",
          description: "Roter Wein mit Beeren",
          rating: 4,
        },
      ],
    },
    {
      name: "Klassische Shisha",
      description: "Traditionelle Aromen",
      items: [
        {
          name: "Double Apple",
          price: "€18",
          description: "Klassischer Apfel-Geschmack",
          rating: 4,
        },
        {
          name: "Mint Fresh",
          price: "€17",
          description: "Erfrischende Minze",
          rating: 4,
        },
        { name: "Grape", price: "€19", description: "Süße Traube", rating: 4 },
      ],
    },
    {
      name: "Getränke",
      description: "Erfrischende Getränke",
      items: [
        {
          name: "Royal Tea",
          price: "€8",
          description: "Premium Tee mit Honig",
          rating: 5,
        },
        {
          name: "Fresh Juice",
          price: "€6",
          description: "Frisch gepresste Säfte",
          rating: 4,
        },
        {
          name: "Coffee Royal",
          price: "€7",
          description: "Arabischer Kaffee",
          rating: 4,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-royal-gradient pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Crown className="w-16 h-16 mx-auto text-royal-gold mb-6" />
            <h1 className="text-5xl md:text-6xl font-royal font-bold text-white mb-6 royal-text-glow">
              Unser Menü
            </h1>
            <p className="text-xl text-royal-cream-light max-w-3xl mx-auto mb-8">
              Entdecken Sie unsere exklusive Auswahl an Premium-Shisha und
              königlichen Getränken
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-royal-cream-light">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-royal-gold" />
                <span>Frische Zubereitung</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-royal-gold" />
                <span>Premium Qualität</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-royal-gold" />
                <span>Für 2-4 Personen</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-20 bg-royal-gradient-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-royal font-bold text-royal-charcoal mb-4">
                  {category.name}
                </h2>
                <p className="text-lg text-royal-charcoal-light max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="royal-card-luxury p-6 royal-hover-lift group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-royal font-semibold text-royal-charcoal group-hover:text-royal-gold transition-colors duration-300">
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < item.rating
                                ? "text-royal-gold fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-royal-charcoal-light mb-4 text-sm leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-royal font-bold text-royal-gold">
                        {item.price}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-royal-gradient-gold text-royal-charcoal px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 royal-hover-glow flex items-center space-x-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Bestellen</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-20 royal-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Crown className="w-12 h-12 mx-auto text-royal-gold mb-4" />
            <h2 className="text-4xl font-royal font-bold text-royal-gold mb-4 royal-text-glow">
              Spezielle Angebote
            </h2>
            <p className="text-xl text-royal-cream-light max-w-3xl mx-auto">
              Exklusive Pakete für den perfekten königlichen Abend
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Royal Package",
                price: "€45",
                description: "Premium Shisha + 2 Getränke + Snacks",
                originalPrice: "€60",
                popular: true,
              },
              {
                name: "Group Special",
                price: "€80",
                description: "2 Shishas + 4 Getränke + Premium Snacks",
                originalPrice: "€110",
              },
              {
                name: "VIP Experience",
                price: "€120",
                description: "3 Premium Shishas + 6 Getränke + Full Service",
                originalPrice: "€160",
              },
            ].map((offer, index) => (
              <motion.div
                key={offer.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative royal-glass p-8 rounded-2xl royal-glow border border-royal-gold/30"
              >
                {offer.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-royal-gold text-royal-charcoal px-4 py-1 rounded-full text-sm font-bold">
                      Beliebt
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-royal font-bold text-royal-gold mb-3">
                  {offer.name}
                </h3>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-3xl font-royal font-bold text-white">
                    {offer.price}
                  </span>
                  <span className="text-royal-cream-light line-through">
                    {offer.originalPrice}
                  </span>
                </div>
                <p className="text-royal-cream-light mb-6">
                  {offer.description}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-royal-gradient-gold text-royal-charcoal py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 royal-hover-glow"
                >
                  Jetzt buchen
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;
