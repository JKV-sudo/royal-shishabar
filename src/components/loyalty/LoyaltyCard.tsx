import React from "react";
import { motion } from "framer-motion";
import { Crown, Gift, Star, Phone, Calendar } from "lucide-react";
import {
  LoyaltyCard as LoyaltyCardType,
  LOYALTY_CONFIG,
} from "../../types/loyalty";
import { LoyaltyService } from "../../services/loyaltyService";

interface LoyaltyCardProps {
  loyaltyCard: LoyaltyCardType;
  showActions?: boolean;
  onRedeemFreeShisha?: () => void;
}

const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
  loyaltyCard,
  showActions = false,
  onRedeemFreeShisha,
}) => {
  const progressPercentage = LoyaltyService.calculateProgressPercentage(
    loyaltyCard.stamps
  );
  const stampsNeeded =
    LOYALTY_CONFIG.STAMPS_FOR_FREE_SHISHA - loyaltyCard.stamps;

  // Create array for stamp visualization
  const stampSlots = Array.from(
    { length: LOYALTY_CONFIG.STAMPS_FOR_FREE_SHISHA },
    (_, index) => ({
      filled: index < loyaltyCard.stamps,
      index,
    })
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-royal-gold to-royal-gold/80 rounded-royal p-6 text-royal-charcoal shadow-2xl border border-royal-gold/50 royal-glow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Crown className="w-6 h-6 text-royal-charcoal" />
          <h3 className="text-xl font-royal font-bold">Royal Stempelpass</h3>
        </div>
        {loyaltyCard.freeShishaEarned > 0 && (
          <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
            <Gift className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {loyaltyCard.freeShishaEarned} Gratis
            </span>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="mb-4 space-y-1">
        <div className="font-medium text-lg">{loyaltyCard.customerName}</div>
        <div className="flex items-center space-x-1 text-royal-charcoal/70">
          <Phone className="w-3 h-3" />
          <span className="text-sm">{loyaltyCard.customerPhone}</span>
        </div>
        {loyaltyCard.lastStampDate && (
          <div className="flex items-center space-x-1 text-royal-charcoal/70">
            <Calendar className="w-3 h-3" />
            <span className="text-sm">
              Letzter Stempel:{" "}
              {loyaltyCard.lastStampDate.toLocaleDateString("de-DE")}
            </span>
          </div>
        )}
      </div>

      {/* Stamp Grid */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Stempel: {loyaltyCard.stamps}/
            {LOYALTY_CONFIG.STAMPS_FOR_FREE_SHISHA}
          </span>
          <span className="text-sm text-royal-charcoal/70">
            {stampsNeeded > 0
              ? `${stampsNeeded} bis zur nächsten gratis Shisha`
              : "Bereit für gratis Shisha!"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-royal-charcoal/20 rounded-full h-2 mb-3">
          <motion.div
            className="bg-royal-charcoal h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Stamp Slots */}
        <div className="grid grid-cols-5 gap-2">
          {stampSlots.map((slot) => (
            <motion.div
              key={slot.index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: slot.index * 0.1 }}
              className={`
                aspect-square rounded-full flex items-center justify-center
                ${
                  slot.filled
                    ? "bg-royal-charcoal text-royal-gold border-2 border-royal-charcoal"
                    : "bg-royal-charcoal/20 border-2 border-royal-charcoal/30 border-dashed"
                }
              `}
            >
              {slot.filled && <Star className="w-4 h-4 fill-current" />}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div>
          <div className="text-2xl font-bold text-royal-charcoal">
            {loyaltyCard.totalShishaOrders}
          </div>
          <div className="text-xs text-royal-charcoal/70">Gesamt Shishas</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-royal-charcoal">
            {loyaltyCard.freeShishaEarned}
          </div>
          <div className="text-xs text-royal-charcoal/70">Gratis verdient</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-royal-charcoal">
            {loyaltyCard.freeShishaUsed}
          </div>
          <div className="text-xs text-royal-charcoal/70">Gratis eingelöst</div>
        </div>
      </div>

      {/* Actions */}
      {showActions &&
        loyaltyCard.freeShishaEarned > 0 &&
        onRedeemFreeShisha && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRedeemFreeShisha}
            className="w-full bg-royal-charcoal text-royal-gold py-3 rounded-royal font-medium hover:bg-royal-charcoal/90 transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <Gift className="w-5 h-5" />
            <span>Gratis Shisha einlösen</span>
          </motion.button>
        )}

      {/* Achievement Badge */}
      {loyaltyCard.totalShishaOrders >= 50 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 bg-royal-charcoal text-royal-gold px-3 py-1 rounded-full text-sm text-center font-medium"
        >
          🏆 Royal VIP - {loyaltyCard.totalShishaOrders}+ Shishas genossen!
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoyaltyCard;
