import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirestoreDB } from "../../config/firebase";
import { Table } from "../../types/reservation";
import { ReservationService } from "../../services/reservationService";
import { useAdminDataLoader } from "../../hooks/useAdminDataLoader";
import { retryFirebaseOperation } from "../../utils/retryOperation";
import {
  ErrorEmptyState,
  NoDataEmptyState,
  CreateEmptyState,
} from "../common/EmptyState";
import { toast } from "react-hot-toast";
import {
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Home,
  TreePine,
  Crown,
  MapPin,
} from "lucide-react";

interface TableFormData {
  number: number;
  capacity: number;
  location: "indoor" | "outdoor" | "vip";
  amenities: string[];
  priceMultiplier: number;
}

export const TableManagement: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [savingTable, setSavingTable] = useState(false);
  const [updatingTable, setUpdatingTable] = useState<string | null>(null);
  const [formData, setFormData] = useState<TableFormData>({
    number: 1,
    capacity: 2,
    location: "indoor",
    amenities: ["smoking_area"],
    priceMultiplier: 1.0,
  });

  const amenityOptions = [
    "smoking_area",
    "private",
    "view",
    "bar_access",
    "fresh_air",
  ];

  const locationOptions = [
    {
      value: "indoor",
      label: "Innenbereich",
      icon: <Home className="w-4 h-4" />,
    },
    {
      value: "outdoor",
      label: "Außenbereich",
      icon: <TreePine className="w-4 h-4" />,
    },
    { value: "vip", label: "VIP Bereich", icon: <Crown className="w-4 h-4" /> },
  ];

  // Use our robust data loader
  const {
    data: tables,
    loading,
    error,
    isEmpty,
    loadData,
    reload,
    setError,
    clearError,
  } = useAdminDataLoader<Table[]>({
    initialData: [],
    onSuccess: (data) => {
      console.log(
        "📊 TableManagement: Tables loaded successfully:",
        data.length
      );
      toast.success(`${data.length} Tische geladen`);
    },
    onError: (error) => {
      console.error("❌ TableManagement: Failed to load tables:", error);
      toast.error("Fehler beim Laden der Tische");
    },
    checkEmpty: (data) => data.length === 0,
  });

  // Load tables when component mounts
  useEffect(() => {
    console.log("🔄 TableManagement: Loading tables");
    loadData(async () => {
      return await retryFirebaseOperation(
        () => ReservationService.getTables(),
        3
      );
    });
  }, []);

  // Handle table status toggle with retry logic
  const handleToggleActive = async (table: Table) => {
    if (updatingTable === table.id) return;

    setUpdatingTable(table.id);
    clearError();

    try {
      const db = getFirestoreDB();

      await retryFirebaseOperation(async () => {
        await updateDoc(doc(db, "tables", table.id), {
          isActive: !table.isActive,
        });
      }, 3);

      toast.success(
        `Tisch ${table.number} ${table.isActive ? "deaktiviert" : "aktiviert"}`
      );

      // Reload data to ensure consistency
      await reload();
    } catch (err) {
      console.error("❌ Error updating table:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(
        `Fehler beim Aktualisieren von Tisch ${table.number}: ${errorMessage}`
      );
      toast.error(`Fehler beim Aktualisieren von Tisch ${table.number}`);
    } finally {
      setUpdatingTable(null);
    }
  };

  // Handle table editing
  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      capacity: table.capacity,
      location: table.location,
      amenities: table.amenities,
      priceMultiplier: table.priceMultiplier,
    });
    setShowAddForm(true);
  };

  // Handle table deletion with retry logic
  const handleDeleteTable = async (table: Table) => {
    if (updatingTable === table.id) return;

    if (
      !window.confirm(`Möchten Sie Tisch ${table.number} wirklich löschen?`)
    ) {
      return;
    }

    setUpdatingTable(table.id);
    clearError();

    try {
      const db = getFirestoreDB();

      await retryFirebaseOperation(async () => {
        await deleteDoc(doc(db, "tables", table.id));
      }, 3);

      toast.success(`Tisch ${table.number} gelöscht`);

      // Reload data to ensure consistency
      await reload();
    } catch (err) {
      console.error("❌ Error deleting table:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(
        `Fehler beim Löschen von Tisch ${table.number}: ${errorMessage}`
      );
      toast.error(`Fehler beim Löschen von Tisch ${table.number}`);
    } finally {
      setUpdatingTable(null);
    }
  };

  // Handle table save with retry logic
  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();

    if (savingTable) return;

    setSavingTable(true);
    clearError();

    try {
      const db = getFirestoreDB();

      const tableData = {
        ...formData,
        isActive: true,
      };

      await retryFirebaseOperation(async () => {
        if (editingTable) {
          // Update existing table
          await updateDoc(doc(db, "tables", editingTable.id), tableData);
        } else {
          // Add new table
          await addDoc(collection(db, "tables"), tableData);
        }
      }, 3);

      const action = editingTable ? "aktualisiert" : "erstellt";
      toast.success(`Tisch ${formData.number} ${action}`);

      // Reset form
      setShowAddForm(false);
      setEditingTable(null);
      setFormData({
        number: 1,
        capacity: 2,
        location: "indoor",
        amenities: ["smoking_area"],
        priceMultiplier: 1.0,
      });

      // Reload data to ensure consistency
      await reload();
    } catch (err) {
      console.error("❌ Error saving table:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(
        `Fehler beim Speichern von Tisch ${formData.number}: ${errorMessage}`
      );
      toast.error(`Fehler beim Speichern von Tisch ${formData.number}`);
    } finally {
      setSavingTable(false);
    }
  };

  // Handle cleanup and reset with retry logic
  const handleCleanupAndReset = async () => {
    if (
      !window.confirm(
        "Dies wird ALLE TISCHE LÖSCHEN und das Standard 30-Tische Layout wiederherstellen. Diese Aktion kann nicht rückgängig gemacht werden. Fortfahren?"
      )
    ) {
      return;
    }

    clearError();

    try {
      await loadData(async () => {
        const db = getFirestoreDB();

        // Delete all existing tables
        const tablesSnapshot = await getDocs(collection(db, "tables"));
        const batch = writeBatch(db);

        tablesSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log("All tables deleted");

        // Reinitialize tables
        await ReservationService.initializeSampleTables();
        console.log("Tables reinitialized");

        // Also initialize time slots to make sure they exist
        await ReservationService.initializeSampleTimeSlots();
        console.log("Time slots initialized");

        // Return the new tables
        return await ReservationService.getTables();
      });

      toast.success("Tische erfolgreich zurückgesetzt");
    } catch (err) {
      console.error("❌ Error during cleanup and reset:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(`Fehler beim Zurücksetzen der Tische: ${errorMessage}`);
      toast.error("Fehler beim Zurücksetzen der Tische");
    }
  };

  // Handle table initialization
  const handleInitializeTables = async () => {
    if (
      !window.confirm(
        "Dies wird das Standard 30-Tische Layout erstellen. Fortfahren?"
      )
    ) {
      return;
    }

    clearError();

    try {
      await loadData(async () => {
        await ReservationService.initializeSampleTables();
        await ReservationService.initializeSampleTimeSlots();
        return await ReservationService.getTables();
      });

      toast.success("Tische erfolgreich initialisiert");
    } catch (err) {
      console.error("❌ Error initializing tables:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(`Fehler beim Initialisieren der Tische: ${errorMessage}`);
      toast.error("Fehler beim Initialisieren der Tische");
    }
  };

  const handleToggleAmenity = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter((a) => a !== amenity)
      : [...formData.amenities, amenity];

    setFormData({ ...formData, amenities: newAmenities });
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case "indoor":
        return <Home className="w-4 h-4" />;
      case "outdoor":
        return <TreePine className="w-4 h-4" />;
      case "vip":
        return <Crown className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getLocationLabel = (location: string) => {
    const option = locationOptions.find((opt) => opt.value === location);
    return option ? option.label : location;
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Laden der Tische...</span>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorEmptyState
          title="Fehler beim Laden der Tische"
          description={error}
          onRetry={reload}
          retrying={loading}
        />
      </div>
    );
  }

  // Handle empty state
  if (isEmpty) {
    return (
      <div className="p-6">
        <CreateEmptyState
          title="Keine Tische vorhanden"
          description="Erstellen Sie Ihre ersten Tische, um mit der Reservierungsverwaltung zu beginnen."
          onAdd={handleInitializeTables}
          addLabel="Standard-Tische erstellen"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Tischverwaltung ({tables?.length || 0} Tische)
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={reload}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Aktualisieren</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Tisch hinzufügen</span>
          </button>
          <button
            onClick={handleCleanupAndReset}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Zurücksetzen</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {tables?.map((table) => (
          <div
            key={table.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              table.isActive
                ? "border-green-200 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">
                  Tisch {table.number}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    table.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {table.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleToggleActive(table)}
                  disabled={updatingTable === table.id}
                  className={`p-1 rounded transition-colors ${
                    updatingTable === table.id
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {updatingTable === table.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : table.isActive ? (
                    <ToggleRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleEditTable(table)}
                  disabled={updatingTable === table.id}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTable(table)}
                  disabled={updatingTable === table.id}
                  className="p-1 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Kapazität:</span>
                <span className="font-medium">{table.capacity} Personen</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Bereich:</span>
                <div className="flex items-center space-x-1">
                  {getLocationIcon(table.location)}
                  <span className="font-medium">
                    {getLocationLabel(table.location)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Preismultiplikator:</span>
                <span className="font-medium">{table.priceMultiplier}x</span>
              </div>
              {table.amenities.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Ausstattung:</span>
                  <div className="flex flex-wrap gap-1">
                    {table.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingTable
                  ? `Tisch ${editingTable.number} bearbeiten`
                  : "Neuen Tisch hinzufügen"}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTable(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tischnummer
                </label>
                <input
                  type="number"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapazität
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="20"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bereich
                </label>
                <select
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preismultiplikator
                </label>
                <input
                  type="number"
                  value={formData.priceMultiplier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceMultiplier: parseFloat(e.target.value),
                    })
                  }
                  min="0.5"
                  max="5"
                  step="0.1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ausstattung
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {amenityOptions.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleToggleAmenity(amenity)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={savingTable}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingTable ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Speichern...</span>
                    </>
                  ) : (
                    <span>{editingTable ? "Aktualisieren" : "Hinzufügen"}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTable(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
