import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Search,
  Users,
  Star,
  Gift,
  TrendingUp,
  Phone,
  Calendar,
  Eye,
  Plus,
} from "lucide-react";
import { LoyaltyService } from "../../services/loyaltyService";
import { LoyaltyCard, LoyaltyTransaction } from "../../types/loyalty";
import LoyaltySearch from "../loyalty/LoyaltySearch";
import LoadingSpinner from "../common/LoadingSpinner";

interface LoyaltyStats {
  totalCards: number;
  activeCards: number;
  totalStampsIssued: number;
  totalFreeShishasEarned: number;
  totalFreeShishasRedeemed: number;
  totalShishasSold: number;
}

const LoyaltyManagement = () => {
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<LoyaltyCard | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [stats, setStats] = useState<LoyaltyStats>({
    totalCards: 0,
    activeCards: 0,
    totalStampsIssued: 0,
    totalFreeShishasEarned: 0,
    totalFreeShishasRedeemed: 0,
    totalShishasSold: 0,
  });

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = async () => {
    setLoading(true);
    try {
      // Since we don't have a direct method to get all cards, we'll simulate the stats
      // In a real implementation, you'd add a method to get all loyalty cards with pagination
      calculateStats([]);
    } catch (error) {
      console.error("Error loading loyalty data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (cards: LoyaltyCard[]) => {
    const newStats: LoyaltyStats = {
      totalCards: cards.length,
      activeCards: cards.filter((card) => card.isActive).length,
      totalStampsIssued: cards.reduce(
        (sum, card) => sum + card.stamps + card.freeShishaEarned * 10,
        0
      ),
      totalFreeShishasEarned: cards.reduce(
        (sum, card) => sum + card.freeShishaEarned,
        0
      ),
      totalFreeShishasRedeemed: cards.reduce(
        (sum, card) => sum + card.freeShishaUsed,
        0
      ),
      totalShishasSold: cards.reduce(
        (sum, card) => sum + card.totalShishaOrders,
        0
      ),
    };
    setStats(newStats);
  };

  const handleCardSelected = async (card: LoyaltyCard) => {
    setSelectedCard(card);
    await loadTransactions(card.id);
    setShowTransactions(true);
  };

  const loadTransactions = async (cardId: string) => {
    try {
      const cardTransactions = await LoyaltyService.getLoyaltyTransactions(
        cardId
      );
      setTransactions(cardTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
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

  const filteredCards = loyaltyCards.filter(
    (card) =>
      card.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.customerPhone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-royal font-bold text-royal-charcoal flex items-center space-x-2">
            <Crown className="w-7 h-7 text-royal-gold" />
            <span>Stempelpass Verwaltung</span>
          </h2>
          <p className="text-royal-charcoal/70 mt-1">
            Verwalten Sie Kundenstempelkarten und Treuepunkte
          </p>
        </div>

        <button
          onClick={() => setShowSearch(!showSearch)}
          className="bg-royal-gold text-royal-charcoal px-4 py-2 rounded-royal hover:bg-royal-gold/90 transition-colors duration-300 flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Karte suchen</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-royal-gold to-royal-gold/80 p-6 rounded-royal text-royal-charcoal shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-charcoal/70 text-sm">Gesamt Karten</p>
              <p className="text-3xl font-bold">{stats.totalCards}</p>
            </div>
            <Users className="w-8 h-8 text-royal-charcoal/50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-royal text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Aktive Karten</p>
              <p className="text-3xl font-bold">{stats.activeCards}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-white/50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-royal text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Stempel ausgegeben</p>
              <p className="text-3xl font-bold">{stats.totalStampsIssued}</p>
            </div>
            <Star className="w-8 h-8 text-white/50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-royal text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Gratis Shishas verdient</p>
              <p className="text-3xl font-bold">
                {stats.totalFreeShishasEarned}
              </p>
            </div>
            <Gift className="w-8 h-8 text-white/50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-royal text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Gratis Shishas eingelöst</p>
              <p className="text-3xl font-bold">
                {stats.totalFreeShishasRedeemed}
              </p>
            </div>
            <Gift className="w-8 h-8 text-white/50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-royal text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Shishas verkauft</p>
              <p className="text-3xl font-bold">{stats.totalShishasSold}</p>
            </div>
            <Crown className="w-8 h-8 text-white/50" />
          </div>
        </motion.div>
      </div>

      {/* Search Section */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-royal p-6 shadow-lg border border-royal-gold/20"
        >
          <LoyaltySearch
            onCardSelected={handleCardSelected}
            showCreateNew={true}
            onCreateNew={() => loadLoyaltyData()}
          />
        </motion.div>
      )}

      {/* Customer Card Display */}
      {selectedCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-royal p-6 shadow-lg border border-royal-gold/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-royal font-bold text-royal-charcoal">
              Kundenkarte Details
            </h3>
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="flex items-center space-x-2 bg-royal-gold/10 text-royal-charcoal px-3 py-1 rounded-royal hover:bg-royal-gold/20 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>
                {showTransactions ? "Historie ausblenden" : "Historie anzeigen"}
              </span>
            </button>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-royal-charcoal">Name:</span>
                <span className="text-royal-charcoal/70">
                  {selectedCard.customerName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-royal-charcoal/50" />
                <span className="text-royal-charcoal/70">
                  {selectedCard.customerPhone}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-royal-charcoal/50" />
                <span className="text-royal-charcoal/70">
                  Erstellt: {selectedCard.createdAt.toLocaleDateString("de-DE")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-royal-gold/10 rounded-royal">
                <div className="text-2xl font-bold text-royal-charcoal">
                  {selectedCard.stamps}
                </div>
                <div className="text-sm text-royal-charcoal/70">
                  Aktuelle Stempel
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-royal">
                <div className="text-2xl font-bold text-green-600">
                  {selectedCard.freeShishaEarned}
                </div>
                <div className="text-sm text-green-600/70">
                  Gratis verfügbar
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          {showTransactions && (
            <div className="border-t border-royal-gold/20 pt-4">
              <h4 className="font-royal font-bold text-royal-charcoal mb-3">
                Transaktions-Historie
              </h4>
              {transactions.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-royal"
                    >
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-600">
                            {transaction.createdAt.toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        {transaction.stampsChanged > 0 && (
                          <div className="text-green-600 font-bold">
                            +{transaction.stampsChanged}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-royal-charcoal/70 text-center py-4">
                  Keine Transaktionen vorhanden
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LoyaltyManagement;
