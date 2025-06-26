import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Upload, Calendar, Tag, Percent, Euro } from "lucide-react";
import { SpecialOffer } from "../../types/menu";
import { SpecialOfferService } from "../../services/specialOfferService";
import { toast } from "react-hot-toast";

interface SpecialOfferFormProps {
  offer?: SpecialOffer;
  onClose: () => void;
  onSuccess: () => void;
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
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    originalPrice: 0,
    discountPercentage: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    category: "food" as SpecialOffer["category"],
    maxUses: "",
    terms: [""],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title,
        description: offer.description,
        originalPrice: offer.originalPrice,
        discountPercentage: offer.discountPercentage,
        startDate: offer.startDate.toISOString().split("T")[0],
        endDate: offer.endDate.toISOString().split("T")[0],
        category: offer.category,
        maxUses: offer.maxUses?.toString() || "",
        terms: offer.terms?.length ? offer.terms : [""],
        isActive: offer.isActive,
      });
      if (offer.imageUrl) {
        setImagePreview(offer.imageUrl);
      }
    }
  }, [offer]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTermsChange = (index: number, value: string) => {
    const newTerms = [...formData.terms];
    newTerms[index] = value;
    setFormData((prev) => ({ ...prev, terms: newTerms }));
  };

  const addTerm = () => {
    setFormData((prev) => ({
      ...prev,
      terms: [...prev.terms, ""],
    }));
  };

  const removeTerm = (index: number) => {
    if (formData.terms.length > 1) {
      const newTerms = formData.terms.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, terms: newTerms }));
    }
  };

  const calculateDiscountedPrice = () => {
    if (formData.originalPrice > 0 && formData.discountPercentage >= 0) {
      return formData.originalPrice * (1 - formData.discountPercentage / 100);
    }
    return 0;
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Titel ist erforderlich");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Beschreibung ist erforderlich");
      return false;
    }
    if (formData.originalPrice <= 0) {
      toast.error("Ursprungspreis muss größer als 0 sein");
      return false;
    }
    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      toast.error("Rabatt muss zwischen 0 und 100% liegen");
      return false;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("Enddatum muss nach dem Startdatum liegen");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const discountedPrice = calculateDiscountedPrice();
      const offerData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        originalPrice: formData.originalPrice,
        discountedPrice,
        discountPercentage: formData.discountPercentage,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        category: formData.category,
        isActive: formData.isActive,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        currentUses: offer?.currentUses || 0,
        terms: formData.terms.filter((term) => term.trim()),
        imageUrl: imagePreview || undefined,
        createdBy: "admin",
      };

      if (offer?.id) {
        await SpecialOfferService.updateSpecialOffer(offer.id, offerData);
        toast.success("Sonderangebot erfolgreich aktualisiert");
      } else {
        await SpecialOfferService.createSpecialOffer(offerData);
        toast.success("Sonderangebot erfolgreich erstellt");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving special offer:", error);
      toast.error("Fehler beim Speichern des Sonderangebots");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-royal-charcoal-dark rounded-royal p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-royal font-bold text-royal-cream">
            {offer ? "Sonderangebot bearbeiten" : "Neues Sonderangebot"}
          </h2>
          <button
            onClick={onClose}
            className="text-royal-cream hover:text-royal-gold transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Titel *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream placeholder-royal-cream/50 focus:outline-none focus:border-royal-gold"
              placeholder="Angebotstitel eingeben"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Beschreibung *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream placeholder-royal-cream/50 focus:outline-none focus:border-royal-gold resize-none"
              placeholder="Detaillierte Beschreibung des Angebots"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Kategorie
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream focus:outline-none focus:border-royal-gold"
            >
              {SPECIAL_OFFER_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Ursprungspreis (€) *
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-cream/50 w-4 h-4" />
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream focus:outline-none focus:border-royal-gold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Rabatt (%) *
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-cream/50 w-4 h-4" />
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full pl-10 pr-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream focus:outline-none focus:border-royal-gold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Neuer Preis (€)
              </label>
              <div className="px-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-gold font-bold">
                {calculateDiscountedPrice().toFixed(2)}€
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Startdatum *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-cream/50 w-4 h-4" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream focus:outline-none focus:border-royal-gold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Enddatum *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-cream/50 w-4 h-4" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream focus:outline-none focus:border-royal-gold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Maximale Nutzungen (optional)
            </label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream focus:outline-none focus:border-royal-gold"
              placeholder="Unbegrenzt wenn leer"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Bild (optional)
            </label>
            <div className="border-2 border-dashed border-royal-gold/30 rounded-royal p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-royal-gold mb-2" />
                <span className="text-royal-cream">
                  {imagePreview ? "Bild ändern" : "Bild hochladen"}
                </span>
              </label>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-32 object-cover rounded-royal mx-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Bedingungen (optional)
            </label>
            {formData.terms.map((term, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={term}
                  onChange={(e) => handleTermsChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream focus:outline-none focus:border-royal-gold"
                  placeholder="Bedingung eingeben"
                />
                {formData.terms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTerm(index)}
                    className="px-3 py-3 bg-red-600 text-white rounded-royal hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTerm}
              className="text-royal-gold hover:text-royal-gold-light transition-colors"
            >
              + Bedingung hinzufügen
            </button>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-4 h-4 text-royal-gold bg-royal-charcoal border-royal-gold/30 rounded focus:ring-royal-gold"
            />
            <label htmlFor="isActive" className="ml-2 text-royal-cream">
              Angebot ist aktiv
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-royal-gradient-gold text-royal-charcoal px-6 py-3 rounded-royal font-royal font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-royal-charcoal border-t-transparent rounded-full animate-spin mr-2" />
                  Speichern...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="w-4 h-4 mr-2" />
                  {offer ? "Aktualisieren" : "Erstellen"}
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-royal-charcoal text-royal-cream border border-royal-gold/30 rounded-royal font-royal font-semibold hover:bg-royal-charcoal-light transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SpecialOfferForm;
