import React, { useState, useEffect } from "react";
import { MenuItem, MENU_CATEGORIES } from "../../types/menu";
import { MenuService } from "../../services/menuService";
import MenuForm from "./MenuForm";
import { Edit, Trash2, Eye, EyeOff, Star, StarOff, Plus } from "lucide-react";

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = MenuService.onMenuItemsChange((items) => {
      setMenuItems(items);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Sind Sie sicher, dass Sie diesen Menüpunkt löschen möchten?"
      )
    ) {
      try {
        await MenuService.deleteMenuItem(id);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Fehler beim Löschen des Menüpunkts"
        );
      }
    }
  };

  const handleToggleAvailability = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      await MenuService.toggleMenuItemAvailability(id, !currentStatus);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Umschalten der Verfügbarkeit"
      );
    }
  };

  const handleTogglePopularity = async (id: string, currentStatus: boolean) => {
    try {
      await MenuService.toggleMenuItemPopularity(id, !currentStatus);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Umschalten der Beliebtheit"
      );
    }
  };

  const handleCreateSampleItems = async () => {
    try {
      await MenuService.createSampleMenuItems();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Erstellen von Beispielartikeln"
      );
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    const cat = MENU_CATEGORIES.find((c) => c.id === category);
    return cat?.icon || "📦";
  };

  const getCategoryName = (category: string) => {
    const cat = MENU_CATEGORIES.find((c) => c.id === category);
    return cat?.name || "Other";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <MenuForm
        item={editingItem || undefined}
        onSave={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
        onCancel={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-royal-charcoal">
            Menü Verwaltung
          </h2>
          <p className="text-gray-600">
            Verwalten Sie Ihre Menüartikel, Kategorien und Verfügbarkeit
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateSampleItems}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Beispielartikel hinzufügen
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-royal-gold text-white rounded-md hover:bg-royal-gold/80 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Artikel hinzufügen
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Menüartikel suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-gold"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-gold"
          >
            <option value="all">Alle Kategorien</option>
            {MENU_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artikel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getCategoryIcon(item.category)}{" "}
                      {getCategoryName(item.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleToggleAvailability(item.id!, item.isAvailable)
                        }
                        className={`p-1 rounded-full ${
                          item.isAvailable
                            ? "text-green-600 hover:text-green-800"
                            : "text-red-600 hover:text-red-800"
                        }`}
                        title={
                          item.isAvailable ? "Verfügbar" : "Nicht verfügbar"
                        }
                      >
                        {item.isAvailable ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleTogglePopularity(
                            item.id!,
                            item.isPopular || false
                          )
                        }
                        className={`p-1 rounded-full ${
                          item.isPopular
                            ? "text-yellow-600 hover:text-yellow-800"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                        title={item.isPopular ? "Beliebt" : "Nicht beliebt"}
                      >
                        {item.isPopular ? (
                          <Star className="w-4 h-4" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                        title="Bearbeiten"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id!)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Keine Menüartikel gefunden.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 px-4 py-2 bg-royal-gold text-white rounded-md hover:bg-royal-gold/80"
            >
              Ihren ersten Menüpunkt hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-royal-charcoal">
            {menuItems.length}
          </div>
          <div className="text-sm text-gray-600">Gesamte Artikel</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {menuItems.filter((item) => item.isAvailable).length}
          </div>
          <div className="text-sm text-gray-600">Verfügbar</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {menuItems.filter((item) => item.isPopular).length}
          </div>
          <div className="text-sm text-gray-600">Beliebt</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {MENU_CATEGORIES.length}
          </div>
          <div className="text-sm text-gray-600">Kategorien</div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
