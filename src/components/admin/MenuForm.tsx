import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { MenuItem, MENU_CATEGORIES } from "../../types/menu";
import { MenuService } from "../../services/menuService";
import { toast } from "react-hot-toast";

interface MenuFormProps {
  item?: MenuItem;
  onSave: () => void;
  onCancel: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "food",
    imageUrl: "",
    isAvailable: true,
    isPopular: false,
    allergens: [] as string[],
    ingredients: [] as string[],
    preparationTime: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl || "",
        isAvailable: item.isAvailable,
        isPopular: item.isPopular || false,
        allergens: item.allergens || [],
        ingredients: Array.isArray(item.ingredients)
          ? item.ingredients
          : item.ingredients
          ? [item.ingredients]
          : [],
        preparationTime: item.preparationTime?.toString() || "",
      });
    }
  }, [item]);

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

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name ist erforderlich");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Beschreibung ist erforderlich");
      return false;
    }
    if (formData.price <= 0) {
      toast.error("Preis muss größer als 0 sein");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price.toString()),
        category: formData.category,
        imageUrl: formData.imageUrl || "",
        isAvailable: formData.isAvailable,
        isPopular: formData.isPopular,
        allergens: formData.allergens.filter((allergen) => allergen.trim()),
        ingredients: formData.ingredients.filter((ingredient) =>
          ingredient.trim()
        ),
        preparationTime: formData.preparationTime || "",
      };

      if (item?.id) {
        await MenuService.updateMenuItem(item.id, itemData);
        toast.success("Menüpunkt erfolgreich aktualisiert");
      } else {
        await MenuService.createMenuItem(itemData);
        toast.success("Menüpunkt erfolgreich erstellt");
      }

      onSave();
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error("Fehler beim Speichern des Menüpunkts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-royal-charcoal-dark rounded-royal p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-royal font-bold text-royal-cream">
            {item ? "Menüpunkt bearbeiten" : "Neuer Menüpunkt"}
          </h2>
          <button
            onClick={onCancel}
            className="text-royal-cream hover:text-royal-gold transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream placeholder-royal-cream/50 focus:outline-none focus:border-royal-gold"
              placeholder="Menüpunkt Name"
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
              placeholder="Detaillierte Beschreibung"
              required
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-royal-cream font-medium mb-2">
                Preis (€) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream focus:outline-none focus:border-royal-gold"
                required
              />
            </div>

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
                {MENU_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preparation Time */}
          <div>
            <label className="block text-royal-cream font-medium mb-2">
              Zubereitungszeit (optional)
            </label>
            <input
              type="text"
              name="preparationTime"
              value={formData.preparationTime}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-royal-charcoal border border-royal-gold/30 rounded-royal text-royal-cream placeholder-royal-cream/50 focus:outline-none focus:border-royal-gold"
              placeholder="z.B. 5-10 Minuten"
            />
          </div>

          {/* Status */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isAvailable: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-royal-gold bg-royal-charcoal border-royal-gold/30 rounded focus:ring-royal-gold"
              />
              <label htmlFor="isAvailable" className="ml-2 text-royal-cream">
                Verfügbar
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPopular"
                name="isPopular"
                checked={formData.isPopular}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPopular: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-royal-gold bg-royal-charcoal border-royal-gold/30 rounded focus:ring-royal-gold"
              />
              <label htmlFor="isPopular" className="ml-2 text-royal-cream">
                Beliebt
              </label>
            </div>
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
                  {item ? "Aktualisieren" : "Erstellen"}
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-royal-charcoal text-royal-cream border border-royal-gold/30 rounded-royal font-royal font-semibold hover:bg-royal-charcoal-light transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuForm;
