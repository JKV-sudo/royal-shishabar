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

interface TableFormData {
  number: number;
  capacity: number;
  location: "indoor" | "outdoor" | "vip";
  amenities: string[];
  priceMultiplier: number;
}

export const TableManagement: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  // const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
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
    { value: "indoor", label: "Innenbereich", icon: "🏠" },
    { value: "outdoor", label: "Außenbereich", icon: "🌿" },
    { value: "vip", label: "VIP Bereich", icon: "👑" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tablesData] = await Promise.all([
        ReservationService.getTables(),
        // ReservationService.getTimeSlots(),
      ]);
      setTables(tablesData);
      // setTimeSlots(timeSlotsData);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (table: Table) => {
    try {
      const db = getFirestoreDB();
      await updateDoc(doc(db, "tables", table.id), {
        isActive: !table.isActive,
      });
      await loadData();
    } catch (err) {
      console.error("Error updating table:", err);
      setError("Failed to update table status");
    }
  };

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

  const handleDeleteTable = async (table: Table) => {
    if (
      window.confirm(`Are you sure you want to delete Table ${table.number}?`)
    ) {
      try {
        const db = getFirestoreDB();
        await deleteDoc(doc(db, "tables", table.id));
        await loadData();
      } catch (err) {
        console.error("Error deleting table:", err);
        setError("Failed to delete table");
      }
    }
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const db = getFirestoreDB();

      const tableData = {
        ...formData,
        isActive: true,
      };

      if (editingTable) {
        // Update existing table
        await updateDoc(doc(db, "tables", editingTable.id), tableData);
      } else {
        // Add new table
        await addDoc(collection(db, "tables"), tableData);
      }

      setShowAddForm(false);
      setEditingTable(null);
      setFormData({
        number: 1,
        capacity: 2,
        location: "indoor",
        amenities: ["smoking_area"],
        priceMultiplier: 1.0,
      });
      await loadData();
    } catch (err) {
      console.error("Error saving table:", err);
      setError("Failed to save table");
    }
  };

  const handleCleanupAndReset = async () => {
    if (
      window.confirm(
        "This will DELETE ALL TABLES and recreate the standard 30-table layout. This action cannot be undone. Continue?"
      )
    ) {
      try {
        setLoading(true);
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

        await loadData();
        setError(null);
      } catch (err) {
        console.error("Error during cleanup and reset:", err);
        setError("Failed to cleanup and reset tables");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInitializeTables = async () => {
    if (
      window.confirm("This will create the standard 30-table layout. Continue?")
    ) {
      try {
        await ReservationService.initializeSampleTables();
        await ReservationService.initializeSampleTimeSlots();
        await loadData();
      } catch (err) {
        console.error("Error initializing tables:", err);
        setError("Failed to initialize tables");
      }
    }
  };

  const handleToggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const getLocationIcon = (location: string) => {
    const option = locationOptions.find((opt) => opt.value === location);
    return option?.icon || "📍";
  };

  const getLocationLabel = (location: string) => {
    const option = locationOptions.find((opt) => opt.value === location);
    return option?.label || location;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Table Management</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Table
          </button>
          <button
            onClick={handleInitializeTables}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Initialize Layout
          </button>
          <button
            onClick={handleCleanupAndReset}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            🗑️ Cleanup & Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`border rounded-lg p-4 transition-all duration-200 ${
              table.isActive
                ? "border-green-300 bg-green-50"
                : "border-red-300 bg-red-50"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Table {table.number}
                </h3>
                <p className="text-sm text-gray-600">
                  {getLocationIcon(table.location)}{" "}
                  {getLocationLabel(table.location)}
                </p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleToggleActive(table)}
                  className={`p-1 rounded ${
                    table.isActive
                      ? "text-green-600 hover:bg-green-100"
                      : "text-red-600 hover:bg-red-100"
                  }`}
                  title={table.isActive ? "Deactivate" : "Activate"}
                >
                  {table.isActive ? "✅" : "❌"}
                </button>
                <button
                  onClick={() => handleEditTable(table)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteTable(table)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium">{table.capacity} people</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price Multiplier:</span>
                <span className="font-medium">{table.priceMultiplier}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-medium ${
                    table.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {table.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {table.amenities.length > 0 && (
                <div>
                  <span className="text-gray-600">Amenities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {table.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                      >
                        {amenity.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tables configured yet.</p>
          <div className="space-x-4">
            <button
              onClick={handleInitializeTables}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Initialize Standard Layout (30 Tables)
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingTable ? "Edit Table" : "Add New Table"}
            </h3>

            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      number: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      capacity: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value as any,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {locationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Multiplier
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={formData.priceMultiplier}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priceMultiplier: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="space-y-2">
                  {amenityOptions.map((amenity) => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleToggleAmenity(amenity)}
                        className="mr-2 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        {amenity.replace("_", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingTable ? "Update" : "Add"} Table
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTable(null);
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Tables:</span>
            <span className="ml-2 font-medium">{tables.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Active:</span>
            <span className="ml-2 font-medium text-green-600">
              {tables.filter((t) => t.isActive).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Inactive:</span>
            <span className="ml-2 font-medium text-red-600">
              {tables.filter((t) => !t.isActive).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Capacity:</span>
            <span className="ml-2 font-medium">
              {tables
                .filter((t) => t.isActive)
                .reduce((sum, t) => sum + t.capacity, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
