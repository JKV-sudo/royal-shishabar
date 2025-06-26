import React, { useState, useEffect } from "react";
import { MenuItem, MENU_CATEGORIES } from "../../types/menu";
import { MenuService } from "../../services/menuService";
import ImageUpload from "../common/ImageUpload";

interface MenuFormProps {
  item?: MenuItem;
  onSave: () => void;
  onCancel: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "food",
    isAvailable: true,
    isPopular: false,
    allergens: [],
    ingredients: [],
    calories: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newAllergen, setNewAllergen] = useState("");
  const [newIngredient, setNewIngredient] = useState("");

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        isPopular: item.isPopular,
        allergens: item.allergens || [],
        ingredients: item.ingredients || [],
        calories: item.calories,
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (item?.id) {
        // Update existing item
        await MenuService.updateMenuItem(item.id, formData);
      } else {
        // Create new item
        await MenuService.createMenuItem({
          ...formData,
          createdBy: "admin", // This should come from auth context
        } as Omit<MenuItem, "id" | "createdAt" | "updatedAt">);
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, imageUrl }));
  };

  const addAllergen = () => {
    if (
      newAllergen.trim() &&
      !formData.allergens?.includes(newAllergen.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        allergens: [...(prev.allergens || []), newAllergen.trim()],
      }));
      setNewAllergen("");
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens?.filter((a) => a !== allergen) || [],
    }));
  };

  const addIngredient = () => {
    if (
      newIngredient.trim() &&
      !formData.ingredients?.includes(newIngredient.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), newIngredient.trim()],
      }));
      setNewIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.filter((i) => i !== ingredient) || [],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-royal-charcoal mb-6">
        {item ? "Menüpunkt bearbeiten" : "Neuen Menüpunkt hinzufügen"}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-royal-charcoal mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-royal-charcoal mb-2">
              Kategorie *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-gold"
            >
              {MENU_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-royal-charcoal mb-2">
            Beschreibung *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-gold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-royal-charcoal mb-2">
              Preis (€) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-royal-charcoal mb-2">
              Kalorien
            </label>
            <input
              type="number"
              min="0"
              value={formData.calories}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  calories: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-gold"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isAvailable: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              <span className="text-sm font-medium text-royal-charcoal">
                Verfügbar
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPopular: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              <span className="text-sm font-medium text-royal-charcoal">
                Beliebt
              </span>
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-royal-charcoal mb-2">
            Bild
          </label>
          <ImageUpload
            value={formData.imageUrl}
            onChange={handleImageUpload}
            folder="menu"
            className="w-full"
          />
        </div>

        {/* Allergens */}
        <div>
          <label className="block text-sm font-medium text-royal-charcoal mb-2">
            Allergene
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newAllergen}
              onChange={(e) => setNewAllergen(e.target.value)}
              placeholder="Allergen hinzufügen..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-gold"
            />
            <button
              type="button"
              onClick={addAllergen}
              className="px-4 py-2 bg-royal-gold text-white rounded-md hover:bg-royal-gold/80"
            >
              Hinzufügen
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.allergens?.map((allergen, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
              >
                {allergen}
                <button
                  type="button"
                  onClick={() => removeAllergen(allergen)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-royal-charcoal mb-2">
            Zutaten
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Zutat hinzufügen..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-gold"
            />
            <button
              type="button"
              onClick={addIngredient}
              className="px-4 py-2 bg-royal-gold text-white rounded-md hover:bg-royal-gold/80"
            >
              Hinzufügen
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.ingredients?.map((ingredient, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {ingredient}
                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-royal-gold text-white rounded-md hover:bg-royal-gold/80 disabled:opacity-50"
          >
            {loading ? "Speichern..." : item ? "Aktualisieren" : "Erstellen"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuForm;
