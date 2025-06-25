import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Users, Music, Crown, Sparkles } from "lucide-react";
import LivePopup from "../components/common/LivePopup";
import SocialBar from "../components/common/SocialBar";
import CountUp from "../components/common/CountUp";
import RoyalShishaLogo from "../assets/Logo.jpeg";

const Home = () => {
  const features = [
    {
      icon: Crown,
      title: "Königliches Erlebnis",
      description:
        "Erleben Sie die feinsten Shisha-Aromen in einer luxuriösen Atmosphäre",
    },
    {
      icon: Music,
      title: "Live-Unterhaltung",
      description:
        "Genießen Sie Live-DJ-Auftritte und erstellen Sie Ihre eigene königliche Playlist",
    },
    {
      icon: Users,
      title: "Exklusive Atmosphäre",
      description:
        "Der perfekte Ort, um stilvoll zu entspannen und sich mit Freunden zu treffen",
    },
    {
      icon: Star,
      title: "Premium-Service",
      description:
        "Professionelles Personal, das sich Ihrem königlichen Wohlbefinden widmet",
    },
  ];

  const stats = [
    { number: 50, suffix: "+", label: "Premium-Aromen" },
    { number: 1000, suffix: "+", label: "Königliche Gäste" },
    { number: 5, suffix: "", label: "Sterne-Bewertung" },
    { number: 24, suffix: "/7", label: "Königlicher Service" },
  ];

  return (
    <div className="min-h-screen">
      <LivePopup />
      <SocialBar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 w-auto min-w-full min-h-full max-w-none transform -translate-x-1/2 -translate-y-1/2 z-0 object-cover"
        >
          {/* Video source removed due to 403 error - using background gradient instead */}
          Your browser does not support the video tag.
        </video>

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        {/* Animated royal elements */}
        <div className="absolute inset-0 z-20">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-20 left-20 w-32 h-32 bg-royal-gold/20 rounded-full blur-xl royal-glow"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-20 right-20 w-40 h-40 bg-royal-purple/20 rounded-full blur-xl royal-glow"
          />
          <motion.div
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-royal-gold/30 rounded-full blur-lg"
          />
        </div>

        {/* Content */}
        <div className="relative z-30 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 5,
              delay: 0.2,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="mb-8"
          >
            <img
              src={RoyalShishaLogo}
              alt="Royal Shisha Logo"
              className="w-40 h-40 mx-auto rounded-full object-cover border-4 border-royal-gold royal-glow-more"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-royal font-bold mb-6 royal-text-glow"
          >
            Royal Shisha
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 text-royal-cream-light"
          >
            Erleben Sie die ultimative königliche Hookah-Lounge in Deutschland
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/menu"
              className="btn-royal-primary text-lg px-8 py-4 royal-hover-glow"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              Menü erkunden
            </Link>
            <Link
              to="/events"
              className="btn-royal-outline text-lg px-8 py-4 royal-hover-glow"
            >
              Events ansehen
            </Link>
          </motion.div>
        </div>

        {/* Royal scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        >
          <div className="w-6 h-10 border-2 border-royal-gold rounded-full flex justify-center royal-glow">
            <div className="w-1 h-3 bg-royal-gold rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-royal-gradient-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Crown className="w-12 h-12 mx-auto text-royal-gold mb-4" />
              <h2 className="text-4xl font-royal font-bold text-royal-charcoal mb-4">
                Warum Royal Shisha wählen?
              </h2>
              <p className="text-xl text-royal-charcoal-light max-w-3xl mx-auto">
                Wir bieten die perfekte königliche Atmosphäre für Entspannung
                und Unterhaltung mit Premium-Qualität Shisha und
                außergewöhnlichem Service.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center royal-card-luxury p-6 royal-hover-lift"
              >
                <div className="w-16 h-16 bg-royal-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 royal-shadow">
                  <feature.icon size={32} className="text-royal-charcoal" />
                </div>
                <h3 className="text-xl font-royal font-semibold text-royal-charcoal mb-2">
                  {feature.title}
                </h3>
                <p className="text-royal-charcoal-light">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 royal-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center royal-glass rounded-xl p-6 royal-hover-glow"
              >
                <div className="text-4xl md:text-5xl font-royal font-bold text-royal-gold mb-2 royal-text-glow">
                  <CountUp end={stat.number} suffix={stat.suffix} />
                </div>
                <div className="text-royal-cream-light font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-royal-gradient-gold">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Crown className="w-16 h-16 mx-auto text-royal-charcoal mb-4" />
            <h2 className="text-4xl font-royal font-bold text-royal-charcoal mb-4">
              Bereit, Royal Shisha zu erleben?
            </h2>
            <p className="text-xl text-royal-charcoal-light mb-8">
              Besuchen Sie uns für einen unvergesslichen Abend mit
              Premium-Shisha und königlicher Unterhaltung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-royal-charcoal text-royal-gold hover:bg-royal-charcoal-dark font-medium py-3 px-8 rounded-royal transition-all duration-300 royal-hover-glow"
              >
                Anfahrt
              </Link>
              <Link
                to="/auth"
                className="bg-transparent text-royal-charcoal border-2 border-royal-charcoal hover:bg-royal-charcoal hover:text-royal-gold font-medium py-3 px-8 rounded-royal transition-all duration-300 royal-hover-glow"
              >
                Royalty beitreten
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 royal-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-royal font-bold text-royal-gold mb-4 royal-text-glow">
                Unser Standort
              </h2>
              <p className="text-xl text-royal-cream-light max-w-3xl mx-auto">
                Finden Sie uns im Herzen der Stadt, bereit, Ihnen ein
                königliches Erlebnis zu bieten.
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative h-96 rounded-xl overflow-hidden royal-shadow-gold"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2662.651733614105!2d12.41793831564884!3d48.2119149792298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47747e0b6238b7b7%3A0x8d5ea32f79641775!2sStadtpl.+2%2C+84478+Waldkraiburg%2C+Germany!5e0!3m2!1sen!2sus!4v1622550978839!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
