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
      className="bg-gradient-to-br from-royal-purple to-royal-purple-light rounded-royal p-6 text-white shadow-2xl border border-royal-purple/50 royal-glow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Crown className="w-6 h-6 text-royal-gold" />
          <h3 className="text-xl font-royal font-bold">Royal Stempelpass</h3>
        </div>
        {loyaltyCard.freeShishaEarned > 0 && (
          <div className="flex items-center space-x-1 bg-royal-gold/20 text-royal-gold px-3 py-1 rounded-full border border-royal-gold/30">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">
              {loyaltyCard.freeShishaEarned} Gratis
            </span>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="mb-4 space-y-1">
        <div className="font-medium text-lg">{loyaltyCard.customerName}</div>
        <div className="flex items-center space-x-1 text-white/80">
          <Phone className="w-3 h-3" />
          <span className="text-sm">{loyaltyCard.customerPhone}</span>
        </div>
        {loyaltyCard.lastStampDate && (
          <div className="flex items-center space-x-1 text-white/80">
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
          <span className="text-sm text-white/80">
            {stampsNeeded > 0
              ? `${stampsNeeded} bis zur nächsten gratis Shisha`
              : "Bereit für gratis Shisha!"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-3">
          <motion.div
            className="bg-royal-gold h-2 rounded-full"
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
                    ? "bg-royal-gold text-royal-purple border-2 border-royal-gold"
                    : "bg-white/20 border-2 border-white/30 border-dashed"
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
          <div className="text-2xl font-bold text-royal-gold">
            {loyaltyCard.totalShishaOrders}
          </div>
          <div className="text-xs text-white/80">Gesamt Shishas</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-royal-gold">
            {loyaltyCard.freeShishaEarned}
          </div>
          <div className="text-xs text-white/80">Gratis verdient</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-royal-gold">
            {loyaltyCard.freeShishaUsed}
          </div>
          <div className="text-xs text-white/80">Gratis eingelöst</div>
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
            className="w-full bg-royal-gold text-royal-purple py-3 rounded-royal font-medium hover:bg-royal-gold/90 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-lg"
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
          className="mt-3 bg-royal-gold/20 border border-royal-gold/30 text-royal-gold px-3 py-1 rounded-full text-sm text-center font-medium"
        >
          🏆 Royal VIP - {loyaltyCard.totalShishaOrders}+ Shishas genossen!
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoyaltyCard;
