import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Gift,
  Star,
  Phone,
  CheckCircle,
  Shield,
  Copy,
} from "lucide-react";
import { LoyaltyService } from "../../services/loyaltyService";
import { LoyaltyCard as LoyaltyCardType } from "../../types/loyalty";
import { CartItem } from "../../types/order";
import LoyaltyCard from "./LoyaltyCard";
import LoadingSpinner from "../common/LoadingSpinner";

interface LoyaltyOrderIntegrationProps {
  cartItems: CartItem[];
  customerPhone?: string;
  customerName?: string;
  onLoyaltyApplied?: (
    discountAmount: number,
    loyaltyCardId: string,
    verificationCode: string
  ) => void;
  onLoyaltyUpdated?: (loyaltyCard: LoyaltyCardType) => void;
  showInOrderFlow?: boolean;
}

const LoyaltyOrderIntegration: React.FC<LoyaltyOrderIntegrationProps> = ({
  cartItems,
  customerPhone = "",
  customerName = "",
  onLoyaltyApplied,
  onLoyaltyUpdated,
  showInOrderFlow = true,
}) => {
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCardType | null>(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(customerPhone);
  const [name, setName] = useState(customerName);
  const [showLoyaltyForm, setShowLoyaltyForm] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);

  const shishaCount = LoyaltyService.countShishaItems(cartItems);
  const hasShishaItems = shishaCount > 0;

  // Generate 6-digit verification code
  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Copy verification code to clipboard
  const copyVerificationCode = () => {
    navigator.clipboard.writeText(verificationCode);
    // Could add a toast notification here
  };

  // Calculate potential discount for free shisha redemption
  const getShishaItemsForDiscount = () => {
    return cartItems.filter(
      (item) =>
        item.category.toLowerCase() === "shisha" ||
        item.category.toLowerCase() === "tobacco"
    );
  };

  const calculateFreeShishaDiscount = (freeShishaToRedeem: number) => {
    const shishaItems = getShishaItemsForDiscount();
    let discount = 0;
    let remainingFreeShishas = freeShishaToRedeem;

    for (const item of shishaItems) {
      if (remainingFreeShishas <= 0) break;

      const itemsToDiscount = Math.min(item.quantity, remainingFreeShishas);
      discount += item.price * itemsToDiscount;
      remainingFreeShishas -= itemsToDiscount;
    }

    return discount;
  };

  // Load loyalty card when phone is provided
  useEffect(() => {
    if (phone && phone.trim()) {
      loadLoyaltyCard(phone.trim());
    }
  }, [phone]);

  const loadLoyaltyCard = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const card = await LoyaltyService.searchLoyaltyCardByPhone(phoneNumber);
      setLoyaltyCard(card);
    } catch (error) {
      console.error("Error loading loyalty card:", error);
    } finally {
      setLoading(false);
    }
  };

  const createLoyaltyCard = async () => {
    if (!phone.trim() || !name.trim()) return;

    setLoading(true);
    try {
      const newCard = await LoyaltyService.getOrCreateLoyaltyCard(
        phone.trim(),
        name.trim()
      );
      setLoyaltyCard(newCard);
      setShowLoyaltyForm(false);
      if (onLoyaltyUpdated) {
        onLoyaltyUpdated(newCard);
      }
    } catch (error) {
      console.error("Error creating loyalty card:", error);
    } finally {
      setLoading(false);
    }
  };

  const redeemFreeShisha = async (shishaCount: number = 1) => {
    if (!loyaltyCard || loyaltyCard.freeShishaEarned < shishaCount) return;

    const discount = calculateFreeShishaDiscount(shishaCount);
    const newVerificationCode = generateVerificationCode();

    setAppliedDiscount(discount);
    setVerificationCode(newVerificationCode);
    setShowVerificationCode(true);

    if (onLoyaltyApplied) {
      onLoyaltyApplied(discount, loyaltyCard.id, newVerificationCode);
    }

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getStampsToEarn = () => {
    return Math.min(shishaCount, 5); // Max 5 stamps per order
  };

  if (!showInOrderFlow && !hasShishaItems) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Loyalty Card Section */}
      {loyaltyCard ? (
        <div className="space-y-4">
          <LoyaltyCard loyaltyCard={loyaltyCard} showActions={false} />

          {/* Shisha Information */}
          {hasShishaItems && (
            <div className="bg-royal-gold/10 rounded-royal p-4 border border-royal-gold/30">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-royal-gold" />
                <span className="font-medium text-royal-charcoal">
                  Diese Bestellung enthält {shishaCount} Shisha
                  {shishaCount > 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-sm text-royal-charcoal/70">
                Sie erhalten {getStampsToEarn()} Stempel für diese Bestellung
              </p>
            </div>
          )}

          {/* Free Shisha Redemption */}
          {loyaltyCard.freeShishaEarned > 0 &&
            hasShishaItems &&
            appliedDiscount === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 rounded-royal p-4 border border-green-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      {loyaltyCard.freeShishaEarned} Gratis Shisha
                      {loyaltyCard.freeShishaEarned > 1 ? "s" : ""} verfügbar!
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 bg-royal-purple text-white px-2 py-1 rounded-full text-xs">
                    <Crown className="w-3 h-3" />
                    <span>Loyalty</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {Array.from(
                    {
                      length: Math.min(
                        loyaltyCard.freeShishaEarned,
                        shishaCount
                      ),
                    },
                    (_, i) => (
                      <button
                        key={i}
                        onClick={() => redeemFreeShisha(i + 1)}
                        className="w-full text-left p-2 bg-green-100 hover:bg-green-200 rounded-royal transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-green-800 font-medium">
                            {i + 1} Gratis Shisha{i > 0 ? "s" : ""} einlösen
                          </span>
                          <span className="text-green-600 font-bold">
                            -{calculateFreeShishaDiscount(i + 1).toFixed(2)}€
                          </span>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            )}

          {/* Applied Discount Display with Verification Code */}
          {appliedDiscount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-royal-purple/10 rounded-royal p-4 border border-royal-purple/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-royal-purple" />
                  <span className="font-medium text-royal-purple">
                    Gratis Shisha eingelöst! Rabatt: -
                    {appliedDiscount.toFixed(2)}€
                  </span>
                </div>
                <div className="flex items-center space-x-1 bg-royal-purple text-white px-2 py-1 rounded-full text-xs">
                  <Crown className="w-3 h-3" />
                  <span>Loyalty</span>
                </div>
              </div>

              {showVerificationCode && (
                <div className="bg-royal-purple/5 rounded-royal p-3 border border-royal-purple/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-royal-purple" />
                      <span className="text-sm font-medium text-royal-purple">
                        Bestätigungscode für Personal:
                      </span>
                    </div>
                    <button
                      onClick={copyVerificationCode}
                      className="text-royal-purple hover:text-royal-purple-light"
                      title="Code kopieren"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-2xl font-bold text-royal-purple bg-white px-4 py-2 rounded-royal border-2 border-royal-purple font-mono">
                      {verificationCode}
                    </span>
                  </div>
                  <p className="text-xs text-royal-purple/70 mt-2 text-center">
                    Zeigen Sie diesen Code dem Personal zur Bestätigung
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      ) : (
        // Loyalty Card Setup
        <div className="bg-royal-cream rounded-royal p-4 border border-royal-gold/30">
          <div className="flex items-center space-x-2 mb-3">
            <Crown className="w-5 h-5 text-royal-gold" />
            <span className="font-medium text-royal-charcoal">
              Royal Stempelpass
            </span>
          </div>

          {hasShishaItems && (
            <div className="mb-3 p-3 bg-royal-gold/10 rounded-royal">
              <p className="text-sm text-royal-charcoal">
                <strong>
                  Diese Bestellung enthält {shishaCount} Shisha
                  {shishaCount > 1 ? "s" : ""}!
                </strong>
                <br />
                Erstellen Sie einen Stempelpass und sammeln Sie Punkte für
                gratis Shishas.
              </p>
            </div>
          )}

          {!showLoyaltyForm ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-royal-charcoal/50" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Telefonnummer eingeben"
                  className="flex-1 px-3 py-2 border border-royal-gold/30 rounded-royal focus:outline-none focus:border-royal-gold"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    phone.trim() &&
                    loadLoyaltyCard(phone.trim())
                  }
                />
                <button
                  onClick={() => phone.trim() && loadLoyaltyCard(phone.trim())}
                  disabled={loading || !phone.trim()}
                  className="px-4 py-2 bg-royal-gold text-royal-charcoal rounded-royal hover:bg-royal-gold/90 disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="sm" /> : "Suchen"}
                </button>
              </div>

              <button
                onClick={() => setShowLoyaltyForm(true)}
                className="w-full text-center text-royal-gold hover:text-royal-gold/80 text-sm"
              >
                Neuen Stempelpass erstellen
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefonnummer"
                className="w-full px-3 py-2 border border-royal-gold/30 rounded-royal focus:outline-none focus:border-royal-gold"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ihr Name"
                className="w-full px-3 py-2 border border-royal-gold/30 rounded-royal focus:outline-none focus:border-royal-gold"
              />
              <div className="flex space-x-2">
                <button
                  onClick={createLoyaltyCard}
                  disabled={loading || !phone.trim() || !name.trim()}
                  className="flex-1 bg-royal-gold text-royal-charcoal py-2 rounded-royal hover:bg-royal-gold/90 disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="sm" /> : "Erstellen"}
                </button>
                <button
                  onClick={() => setShowLoyaltyForm(false)}
                  className="px-4 py-2 border border-royal-gold text-royal-gold rounded-royal hover:bg-royal-gold/10"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 text-green-800 px-6 py-3 rounded-royal shadow-lg border border-green-300"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Gratis Shisha erfolgreich eingelöst!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoyaltyOrderIntegration;
