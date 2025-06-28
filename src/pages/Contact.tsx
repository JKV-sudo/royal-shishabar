import { motion } from "framer-motion";
import { Crown, Phone, Mail, Clock, MapPin } from "lucide-react";
import LocationMap from "../components/maps/LocationMap";

const Contact = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Telefon",
      content: "+49 15781413767",
      action: "tel:+4915781413767",
      actionText: "Anrufen",
    },
    {
      icon: Mail,
      title: "E-Mail",
      content: "Royal.Waldkraiburg@gmail.com",
      action: "mailto:Royal.Waldkraiburg@gmail.com",
      actionText: "E-Mail senden",
    },
    {
      icon: Clock,
      title: "Öffnungszeiten",
      content: "Mo-Fr: 17:00 - 01:00\nSa-So: 17:00 - 03:00",
      action: null,
      actionText: null,
    },
    {
      icon: MapPin,
      title: "Adresse",
      content: "Stadtpl. 2, 84478 Waldkraiburg, Deutschland",
      action:
        "https://maps.google.com/?q=Stadtpl.+2,+84478+Waldkraiburg,+Germany",
      actionText: "In Google Maps öffnen",
    },
  ];

  const handleAction = (action: string | null) => {
    if (action) {
      window.open(action, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-royal-gradient-cream">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-royal-purple-dark to-royal-burgundy overflow-hidden">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <Crown className="w-16 h-16 mx-auto text-royal-gold" />
            </div>
            <h1 className="text-4xl md:text-6xl font-royal font-bold text-white mb-6 royal-text-glow">
              Kontakt
            </h1>
            <p className="text-lg md:text-xl text-royal-cream-light max-w-3xl mx-auto leading-relaxed">
              Bereit für ein königliches Erlebnis? Kontaktieren Sie uns für
              Reservierungen, Fragen oder Feedback
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-royal font-bold text-royal-charcoal mb-4 md:mb-6">
              Kontaktinformationen
            </h2>
            <p className="text-lg md:text-xl text-royal-charcoal/80 max-w-3xl mx-auto">
              Erreichen Sie uns über verschiedene Kanäle für ein persönliches
              Gespräch
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-royal-gradient-gold rounded-royal royal-glow border border-royal-gold/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-royal-gold/20 rounded-full flex items-center justify-center">
                  <info.icon className="w-8 h-8 text-royal-gold" />
                </div>
                <h3 className="text-xl font-royal font-bold text-royal-charcoal mb-3">
                  {info.title}
                </h3>
                <p className="text-royal-charcoal/80 mb-4 whitespace-pre-line">
                  {info.content}
                </p>
                {info.action && (
                  <button
                    onClick={() => handleAction(info.action)}
                    className="px-4 py-2 bg-royal-charcoal text-white rounded-lg hover:bg-royal-charcoal-dark transition-colors text-sm font-semibold"
                  >
                    {info.actionText}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="py-16 md:py-24 bg-royal-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-royal font-bold text-white mb-4 md:mb-6">
              Finden Sie Uns
            </h2>
            <p className="text-lg md:text-xl text-royal-cream-light max-w-3xl mx-auto">
              Besuchen Sie uns in der Innenstadt von Waldkraiburg für ein
              königliches Shisha-Erlebnis
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <LocationMap className="max-w-5xl mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 md:py-24 bg-royal-gradient-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-royal font-bold text-royal-charcoal mb-4 md:mb-6">
              Senden Sie Uns Eine Nachricht
            </h2>
            <p className="text-lg md:text-xl text-royal-charcoal/80 max-w-3xl mx-auto">
              Haben Sie Fragen oder möchten Sie eine Reservierung vornehmen?
              Füllen Sie das Formular aus und wir melden uns bei Ihnen.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-royal shadow-lg p-8 md:p-12"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold text-royal-charcoal mb-2"
                  >
                    Vorname *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold focus:border-transparent transition-all duration-200"
                    placeholder="Ihr Vorname"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-royal-charcoal mb-2"
                  >
                    Nachname *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold focus:border-transparent transition-all duration-200"
                    placeholder="Ihr Nachname"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-royal-charcoal mb-2"
                  >
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold focus:border-transparent transition-all duration-200"
                    placeholder="ihre.email@beispiel.de"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-royal-charcoal mb-2"
                  >
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold focus:border-transparent transition-all duration-200"
                    placeholder="+49 15781413767"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-semibold text-royal-charcoal mb-2"
                >
                  Betreff *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold focus:border-transparent transition-all duration-200"
                >
                  <option value="">Bitte wählen Sie einen Betreff</option>
                  <option value="reservation">Reservierung</option>
                  <option value="question">Allgemeine Frage</option>
                  <option value="feedback">Feedback</option>
                  <option value="complaint">Beschwerde</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-royal-charcoal mb-2"
                >
                  Nachricht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Ihre Nachricht an uns..."
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="px-8 py-4 bg-royal-gradient-gold text-royal-charcoal font-royal font-bold rounded-royal hover:shadow-xl transition-all duration-300 royal-glow hover:scale-105 transform"
                >
                  Nachricht Senden
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
