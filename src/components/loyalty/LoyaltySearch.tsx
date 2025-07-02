import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Phone, Plus, AlertCircle, Crown } from "lucide-react";
import { LoyaltyService } from "../../services/loyaltyService";
import { LoyaltyCard as LoyaltyCardType } from "../../types/loyalty";
import LoyaltyCard from "./LoyaltyCard";
import LoadingSpinner from "../common/LoadingSpinner";

interface LoyaltySearchProps {
  onCardSelected?: (card: LoyaltyCardType) => void;
  showCreateNew?: boolean;
  onCreateNew?: (phone: string, name: string) => void;
}

const LoyaltySearch: React.FC<LoyaltySearchProps> = ({
  onCardSelected,
  showCreateNew = false,
  onCreateNew,
}) => {
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCardType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const searchCard = async () => {
    if (!phone.trim()) {
      setError("Bitte Telefonnummer eingeben");
      return;
    }

    setLoading(true);
    setError("");
    setLoyaltyCard(null);

    try {
      const card = await LoyaltyService.searchLoyaltyCardByPhone(phone.trim());
      if (card) {
        setLoyaltyCard(card);
        if (onCardSelected) {
          onCardSelected(card);
        }
      } else {
        setError("Kein Stempelpass für diese Nummer gefunden");
        if (showCreateNew) {
          setShowCreateForm(true);
        }
      }
    } catch (err) {
      setError("Fehler beim Suchen der Stempelkarte");
      console.error("Error searching loyalty card:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!phone.trim() || !customerName.trim()) {
      setError("Bitte alle Felder ausfüllen");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newCard = await LoyaltyService.getOrCreateLoyaltyCard(
        phone.trim(),
        customerName.trim()
      );
      setLoyaltyCard(newCard);
      setShowCreateForm(false);

      if (onCardSelected) {
        onCardSelected(newCard);
      }
      if (onCreateNew) {
        onCreateNew(phone.trim(), customerName.trim());
      }
    } catch (err) {
      setError("Fehler beim Erstellen der Stempelkarte");
      console.error("Error creating loyalty card:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (showCreateForm) {
        handleCreateNew();
      } else {
        searchCard();
      }
    }
  };

  const resetSearch = () => {
    setPhone("");
    setCustomerName("");
    setLoyaltyCard(null);
    setError("");
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <div className="bg-white rounded-royal p-6 shadow-lg border border-royal-purple/20">
        <h3 className="text-lg font-royal font-bold text-royal-purple mb-4 flex items-center space-x-2">
          <Crown className="w-5 h-5" />
          <span>Stempelpass suchen</span>
        </h3>

        <div className="space-y-4">
          {/* Phone Input */}
          <div>
            <label className="block text-sm font-medium text-royal-charcoal mb-2">
              Telefonnummer
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-purple/60 w-5 h-5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="z.B. +49 123 4567890"
                className="w-full pl-12 pr-4 py-3 border-2 border-royal-purple/20 rounded-royal focus:outline-none focus:border-royal-purple focus:ring-2 focus:ring-royal-purple/20 bg-white text-royal-charcoal placeholder-royal-charcoal/50 transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          {/* Name Input - Only show when creating new */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-royal-charcoal mb-2">
                Kundenname
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Name des Kunden"
                className="w-full px-4 py-3 border-2 border-royal-purple/20 rounded-royal focus:outline-none focus:border-royal-purple focus:ring-2 focus:ring-royal-purple/20 bg-white text-royal-charcoal placeholder-royal-charcoal/50 transition-all duration-200"
                disabled={loading}
              />
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-royal border border-red-200"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!showCreateForm ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={searchCard}
                  disabled={loading || !phone.trim()}
                  className="flex-1 bg-royal-purple text-white py-3 px-6 rounded-royal font-medium hover:bg-royal-purple-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 royal-glow"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span>{loading ? "Suche..." : "Suchen"}</span>
                </motion.button>

                {loyaltyCard && (
                  <button
                    onClick={resetSearch}
                    className="px-6 py-3 border-2 border-royal-purple text-royal-purple rounded-royal hover:bg-royal-purple/10 transition-colors duration-300 font-medium"
                  >
                    Neue Suche
                  </button>
                )}
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateNew}
                  disabled={loading || !phone.trim() || !customerName.trim()}
                  className="flex-1 bg-royal-purple-light text-white py-3 px-6 rounded-royal font-medium hover:bg-royal-purple transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 royal-glow"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>
                    {loading ? "Erstelle..." : "Neuen Stempelpass erstellen"}
                  </span>
                </motion.button>

                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 border-2 border-royal-charcoal/30 text-royal-charcoal/70 rounded-royal hover:bg-royal-charcoal/5 transition-colors duration-300 font-medium"
                >
                  Abbrechen
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loyalty Card Display */}
      {loyaltyCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LoyaltyCard loyaltyCard={loyaltyCard} showActions={true} />
        </motion.div>
      )}
    </div>
  );
};

export default LoyaltySearch;
