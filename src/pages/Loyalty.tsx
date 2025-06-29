import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Phone, History, Gift, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoyaltyService } from "../services/loyaltyService";
import {
  LoyaltyCard as LoyaltyCardType,
  LoyaltyTransaction,
} from "../types/loyalty";
import LoyaltyCard from "../components/loyalty/LoyaltyCard";
import LoyaltySearch from "../components/loyalty/LoyaltySearch";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Loyalty = () => {
  const navigate = useNavigate();
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCardType | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleCardSelected = async (card: LoyaltyCardType) => {
    setLoyaltyCard(card);
    loadTransactions(card.id);
  };

  const loadTransactions = async (cardId: string) => {
    setLoading(true);
    try {
      const cardTransactions = await LoyaltyService.getLoyaltyTransactions(
        cardId
      );
      setTransactions(cardTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: LoyaltyTransaction["type"]) => {
    switch (type) {
      case "stamp_earned":
        return <Star className="w-4 h-4 text-yellow-600" />;
      case "free_shisha_earned":
        return <Gift className="w-4 h-4 text-green-600" />;
      case "free_shisha_redeemed":
        return <Gift className="w-4 h-4 text-blue-600" />;
      default:
        return <Star className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: LoyaltyTransaction["type"]) => {
    switch (type) {
      case "stamp_earned":
        return "bg-yellow-50 border-yellow-200";
      case "free_shisha_earned":
        return "bg-green-50 border-green-200";
      case "free_shisha_redeemed":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-cream to-royal-cream-light">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-purple-dark to-royal-burgundy text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-royal-cream hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück</span>
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <Crown className="w-8 h-8 text-royal-gold" />
            <h1 className="text-3xl md:text-4xl font-royal font-bold">
              Royal Stempelpass
            </h1>
          </div>
          <p className="text-royal-cream-light text-lg">
            Sammeln Sie Stempel und erhalten Sie gratis Shishas
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* How it works section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-royal p-6 shadow-lg border border-royal-gold/20"
          >
            <h2 className="text-2xl font-royal font-bold text-royal-charcoal mb-4">
              So funktioniert's
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-royal-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-royal-gold" />
                </div>
                <h3 className="font-bold text-royal-charcoal mb-2">Sammeln</h3>
                <p className="text-sm text-royal-charcoal/70">
                  Für jede bestellte Shisha erhalten Sie einen Stempel
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-royal-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-8 h-8 text-royal-gold" />
                </div>
                <h3 className="font-bold text-royal-charcoal mb-2">
                  10 Stempel
                </h3>
                <p className="text-sm text-royal-charcoal/70">
                  Bei 10 Stempeln erhalten Sie eine gratis Shisha
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-royal-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-8 h-8 text-royal-gold" />
                </div>
                <h3 className="font-bold text-royal-charcoal mb-2">Einlösen</h3>
                <p className="text-sm text-royal-charcoal/70">
                  Lösen Sie Ihre gratis Shisha bei Ihrer nächsten Bestellung ein
                </p>
              </div>
            </div>
          </motion.div>

          {/* Loyalty Card Search/Display */}
          {!loyaltyCard ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LoyaltySearch
                onCardSelected={handleCardSelected}
                showCreateNew={true}
                onCreateNew={() => {}}
              />
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Loyalty Card Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <LoyaltyCard loyaltyCard={loyaltyCard} showActions={false} />
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex-1 bg-royal-gold text-royal-charcoal py-3 px-6 rounded-royal font-medium hover:bg-royal-gold/90 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <History className="w-5 h-5" />
                  <span>
                    {showHistory ? "Historie ausblenden" : "Historie anzeigen"}
                  </span>
                </button>

                <button
                  onClick={() => navigate("/menu")}
                  className="flex-1 border-2 border-royal-gold text-royal-gold py-3 px-6 rounded-royal font-medium hover:bg-royal-gold hover:text-royal-charcoal transition-colors duration-300"
                >
                  Zur Speisekarte
                </button>

                <button
                  onClick={() => {
                    setLoyaltyCard(null);
                    setTransactions([]);
                    setShowHistory(false);
                  }}
                  className="px-6 py-3 text-royal-charcoal/70 hover:text-royal-charcoal transition-colors duration-300"
                >
                  Neue Suche
                </button>
              </div>

              {/* Transaction History */}
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-royal p-6 shadow-lg border border-royal-gold/20"
                >
                  <h3 className="text-xl font-royal font-bold text-royal-charcoal mb-4 flex items-center space-x-2">
                    <History className="w-5 h-5" />
                    <span>Stempel-Historie</span>
                  </h3>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-royal border ${getTransactionColor(
                            transaction.type
                          )}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getTransactionIcon(transaction.type)}
                              <div>
                                <p className="font-medium text-gray-800">
                                  {transaction.description}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {transaction.createdAt.toLocaleDateString(
                                    "de-DE",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              {transaction.stampsChanged > 0 && (
                                <div className="text-green-600 font-bold">
                                  +{transaction.stampsChanged} Stempel
                                </div>
                              )}
                              {transaction.type === "free_shisha_redeemed" && (
                                <div className="text-blue-600 font-bold">
                                  -{transaction.shishaCount} Gratis
                                </div>
                              )}
                              {transaction.type === "free_shisha_earned" && (
                                <div className="text-green-600 font-bold">
                                  +{transaction.shishaCount} Gratis
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-royal-charcoal/70">
                      <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Noch keine Transaktionen vorhanden</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loyalty;
