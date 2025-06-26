import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Save,
  Plus,
  Trash2,
  Calendar,
  Percent,
  Users,
  Tag,
} from "lucide-react";
import { SpecialOffer } from "../../types/menu";
import { SpecialOfferService } from "../../services/specialOfferService";
import { useAuthStore } from "../../stores/authStore";
import ImageUpload from "../common/ImageUpload";
import { toast } from "react-hot-toast";

interface SpecialOfferFormProps {
  offer?: SpecialOffer;
  onClose: () => void;
  onSave: () => void;
}

const SPECIAL_OFFER_CATEGORIES = [
  { id: "food", name: "Speisen" },
  { id: "drinks", name: "Getränke" },
  { id: "tobacco", name: "Tabak" },
  { id: "combo", name: "Kombi-Angebot" },
  { id: "event", name: "Event-Special" },
  { id: "other", name: "Sonstiges" },
];

const SpecialOfferForm: React.FC<SpecialOfferFormProps> = ({
  offer,
  onClose,
  onSave,
}) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SpecialOffer>>({
    title: "",
    description: "",
    originalPrice: 0,
    discountedPrice: 0,
    discountPercentage: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    isActive: true,
    imageUrl: "",
    terms: [""],
    maxUses: undefined,
    category: "food",
  });

  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title,
        description: offer.description,
        originalPrice: offer.originalPrice,
        discountedPrice: offer.discountedPrice,
        discountPercentage: offer.discountPercentage,
        startDate: offer.startDate,
        endDate: offer.endDate,
        isActive: offer.isActive,
        imageUrl: offer.imageUrl || "",
        terms: offer.terms || [""],
        maxUses: offer.maxUses,
        category: offer.category,
      });
    }
  }, [offer]);

  const calculateDiscountPercentage = (
    original: number,
    discounted: number
  ) => {
    if (original <= 0) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  const calculateDiscountedPrice = (original: number, percentage: number) => {
    return Math.round(((original * (100 - percentage)) / 100) * 100) / 100;
  };

  const handleInputChange = (field: keyof SpecialOffer, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate discount percentage when prices change
      if (field === "originalPrice" || field === "discountedPrice") {
        if (updated.originalPrice && updated.discountedPrice) {
          updated.discountPercentage = calculateDiscountPercentage(
            updated.originalPrice,
            updated.discountedPrice
          );
        }
      }

      // Auto-calculate discounted price when percentage changes
      if (field === "discountPercentage" && updated.originalPrice) {
        updated.discountedPrice = calculateDiscountedPrice(
          updated.originalPrice,
          value
        );
      }

      return updated;
    });
  };

  const handleTermsChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      terms: prev.terms?.map((term, i) => (i === index ? value : term)) || [""],
    }));
  };

  const addTerm = () => {
    setFormData((prev) => ({
      ...prev,
      terms: [...(prev.terms || []), ""],
    }));
  };

  const removeTerm = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      terms: prev.terms?.filter((_, i) => i !== index) || [""],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Sie müssen angemeldet sein");
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.originalPrice ||
      !formData.discountedPrice
    ) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      toast.error("Das Enddatum muss nach dem Startdatum liegen");
      return;
    }

    try {
      setIsLoading(true);

      const offerData = {
        ...formData,
        createdBy: user.uid,
      } as Omit<SpecialOffer, "id" | "createdAt" | "updatedAt" | "currentUses">;

      if (offer) {
        await SpecialOfferService.updateSpecialOffer(offer.id!, offerData);
        toast.success("Sonderangebot erfolgreich aktualisiert");
      } else {
        await SpecialOfferService.createSpecialOffer(offerData);
        toast.success("Sonderangebot erfolgreich erstellt");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving special offer:", error);
      toast.error("Fehler beim Speichern des Sonderangebots");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-royal-charcoal rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-royal-gold/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-royal font-bold text-royal-gold">
              {offer ? "Sonderangebot bearbeiten" : "Neues Sonderangebot"}
            </h2>
            <button
              onClick={onClose}
              className="text-royal-cream-light hover:text-royal-gold transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
                placeholder="Sonderangebot Titel"
                required
              />
            </div>

            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Kategorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
                required
              >
                {SPECIAL_OFFER_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Beschreibung *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none h-24 resize-none"
              placeholder="Beschreibung des Sonderangebots"
              required
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Ursprungspreis (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice}
                onChange={(e) =>
                  handleInputChange(
                    "originalPrice",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Rabatt (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) =>
                  handleInputChange(
                    "discountPercentage",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Reduzierter Preis (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discountedPrice}
                onChange={(e) =>
                  handleInputChange(
                    "discountedPrice",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
                placeholder="0.00"
                readOnly
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Startdatum *
              </label>
              <input
                type="datetime-local"
                value={
                  formData.startDate
                    ? new Date(formData.startDate).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  handleInputChange("startDate", new Date(e.target.value))
                }
                className="w-full px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Enddatum *
              </label>
              <input
                type="datetime-local"
                value={
                  formData.endDate
                    ? new Date(formData.endDate).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  handleInputChange("endDate", new Date(e.target.value))
                }
                className="w-full px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Maximale Nutzungen (optional)
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUses || ""}
                onChange={(e) =>
                  handleInputChange(
                    "maxUses",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
                placeholder="Unbegrenzt"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
                className="w-4 h-4 text-royal-gold bg-royal-charcoal-light border-royal-gold/30 rounded focus:ring-royal-gold"
              />
              <label
                htmlFor="isActive"
                className="text-royal-cream font-medium"
              >
                Angebot ist aktiv
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Bild (optional)
            </label>
            <ImageUpload
              currentImageUrl={formData.imageUrl}
              onImageUploaded={(url) => handleInputChange("imageUrl", url)}
              folder="special-offers"
            />
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Bedingungen (optional)
            </label>
            <div className="space-y-2">
              {formData.terms?.map((term, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleTermsChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
                    placeholder="Bedingung hinzufügen"
                  />
                  {formData.terms && formData.terms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTerm(index)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTerm}
                className="flex items-center space-x-2 text-royal-gold hover:text-royal-gold-light transition-colors"
              >
                <Plus size={16} />
                <span>Bedingung hinzufügen</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-royal-gold/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-royal-cream-light hover:text-royal-cream transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2 bg-royal-gradient-gold text-royal-charcoal rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-royal-charcoal border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{offer ? "Aktualisieren" : "Erstellen"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SpecialOfferForm;
