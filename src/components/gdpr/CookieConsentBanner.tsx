import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  X,
  Cookie,
  Settings,
  Shield,
  BarChart,
  Megaphone,
  Wrench,
} from "lucide-react";
import { CookieConsent } from "../../types/gdpr";
import { GDPRService } from "../../services/gdprService";
import toast from "react-hot-toast";

interface CookieConsentBannerProps {
  onConsentChange?: (consent: CookieConsent) => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onConsentChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
    consentDate: new Date(),
    version: "1.0",
  });

  useEffect(() => {
    // Check if user has already provided consent
    const existingConsent = GDPRService.getCookieConsent();
    if (!existingConsent) {
      setIsVisible(true);
    } else {
      setConsent(existingConsent);
    }
  }, []);

  const handleAcceptAll = async () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      consentDate: new Date(),
      version: "1.0",
    };

    await saveConsent(newConsent);
  };

  const handleAcceptSelected = async () => {
    const newConsent: CookieConsent = {
      ...consent,
      consentDate: new Date(),
      version: "1.0",
    };

    await saveConsent(newConsent);
  };

  const handleRejectNonEssential = async () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentDate: new Date(),
      version: "1.0",
    };

    await saveConsent(newConsent);
  };

  const saveConsent = async (newConsent: CookieConsent) => {
    try {
      await GDPRService.saveCookieConsent(newConsent);
      setConsent(newConsent);
      setIsVisible(false);
      setShowSettings(false);

      if (onConsentChange) {
        onConsentChange(newConsent);
      }

      toast.success("Cookie-Einstellungen gespeichert");

      // Apply consent settings to tracking scripts
      applyConsentSettings(newConsent);
    } catch (error) {
      console.error("Error saving cookie consent:", error);
      toast.error("Fehler beim Speichern der Einstellungen");
    }
  };

  const applyConsentSettings = (consent: CookieConsent) => {
    // Apply analytics consent
    if (consent.analytics) {
      // Enable Google Analytics if configured
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
        });
      }
    } else {
      // Disable analytics
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
        });
      }
    }

    // Apply marketing consent
    if (consent.marketing) {
      // Enable marketing cookies
      if (window.gtag) {
        window.gtag("consent", "update", {
          ad_storage: "granted",
        });
      }
    } else {
      // Disable marketing cookies
      if (window.gtag) {
        window.gtag("consent", "update", {
          ad_storage: "denied",
        });
      }
    }

    // Store consent in localStorage for immediate access
    localStorage.setItem("royal_cookie_consent", JSON.stringify(consent));
  };

  const cookieCategories = [
    {
      id: "necessary",
      name: "Notwendige Cookies",
      description:
        "Diese Cookies sind für das Funktionieren der Website erforderlich und können nicht deaktiviert werden.",
      icon: Shield,
      required: true,
      examples: ["Authentifizierung", "Sicherheit", "Warenkorb"],
    },
    {
      id: "functional",
      name: "Funktionale Cookies",
      description:
        "Diese Cookies ermöglichen verbesserte Funktionalität und Personalisierung.",
      icon: Wrench,
      required: false,
      examples: ["Spracheinstellungen", "Benutzerpräferenzen", "Chat-Support"],
    },
    {
      id: "analytics",
      name: "Analyse-Cookies",
      description:
        "Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.",
      icon: BarChart,
      required: false,
      examples: [
        "Google Analytics",
        "Besuchsstatistiken",
        "Performance-Tracking",
      ],
    },
    {
      id: "marketing",
      name: "Marketing-Cookies",
      description:
        "Diese Cookies werden verwendet, um Ihnen relevante Werbung zu zeigen.",
      icon: Megaphone,
      required: false,
      examples: ["Werbe-Tracking", "Soziale Medien", "Remarketing"],
    },
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto p-6">
          {!showSettings ? (
            // Simple banner view
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Cookie className="h-8 w-8 text-royal-gold flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Wir verwenden Cookies
                  </h3>
                  <p className="text-sm text-gray-600">
                    Wir verwenden Cookies, um Ihnen die beste Erfahrung auf
                    unserer Website zu bieten. Einige sind notwendig für das
                    Funktionieren der Website, andere helfen uns bei der
                    Verbesserung.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Einstellungen
                </button>

                <button
                  onClick={handleRejectNonEssential}
                  className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Nur notwendige
                </button>

                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 text-sm font-medium text-white bg-royal-gold hover:bg-royal-gold/90 rounded-lg transition-colors"
                >
                  Alle akzeptieren
                </button>
              </div>
            </div>
          ) : (
            // Detailed settings view
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Cookie-Einstellungen
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 mb-6">
                {cookieCategories.map((category) => {
                  const Icon = category.icon;
                  const isEnabled = consent[
                    category.id as keyof CookieConsent
                  ] as boolean;

                  return (
                    <div
                      key={category.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className="h-5 w-5 text-royal-gold mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {category.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {category.description}
                            </p>
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Beispiele: </span>
                              {category.examples.join(", ")}
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          {category.required ? (
                            <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                              Erforderlich
                            </span>
                          ) : (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => {
                                  setConsent((prev) => ({
                                    ...prev,
                                    [category.id]: e.target.checked,
                                  }));
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold"></div>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleRejectNonEssential}
                  className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Nur notwendige
                </button>

                <button
                  onClick={handleAcceptSelected}
                  className="px-6 py-2 text-sm font-medium text-white bg-royal-gold hover:bg-royal-gold/90 rounded-lg transition-colors"
                >
                  Auswahl speichern
                </button>

                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 text-sm font-medium text-white bg-royal-gold hover:bg-royal-gold/90 rounded-lg transition-colors"
                >
                  Alle akzeptieren
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Weitere Informationen finden Sie in unserer{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-royal-gold hover:underline"
                  >
                    Datenschutzerklärung
                  </Link>{" "}
                  und unseren{" "}
                  <a
                    href="/cookie-policy"
                    className="text-royal-gold hover:underline"
                  >
                    Cookie-Richtlinien
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
