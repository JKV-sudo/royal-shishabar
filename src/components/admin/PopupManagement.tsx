import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MessageSquare,
  Target,
  Settings,
  Save,
  X,
} from "lucide-react";
import { PopupService, Popup } from "../../services/popupService";

interface PopupFormData {
  title: string;
  message: string;
  type: "info" | "promo" | "event" | "announcement";
  startDate: string;
  endDate: string;
  displayDuration: number;
  targetAudience: "all" | "new" | "returning";
  priority: number;
}

const PopupManagement: React.FC = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [formData, setFormData] = useState<PopupFormData>({
    title: "",
    message: "",
    type: "info",
    startDate: "",
    endDate: "",
    displayDuration: 10,
    targetAudience: "all",
    priority: 1,
  });

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    try {
      setIsLoading(true);
      const popupsData = await PopupService.getPopups();
      setPopups(popupsData);
    } catch (error) {
      toast.error("Failed to load popups");
      console.error("Error loading popups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPopup) {
        await PopupService.updateAdminPopup(editingPopup.id!, formData);
        toast.success("Popup updated successfully");
      } else {
        await PopupService.createAdminPopup(formData);
        toast.success("Popup created successfully");
      }

      setShowForm(false);
      setEditingPopup(null);
      resetForm();
      loadPopups();
    } catch (error) {
      toast.error("Failed to save popup");
      console.error("Error saving popup:", error);
    }
  };

  const handleEdit = (popup: Popup) => {
    setEditingPopup(popup);
    setFormData({
      title: popup.title,
      message: popup.message,
      type:
        popup.type === "promotion"
          ? "promo"
          : popup.type === "alert"
          ? "announcement"
          : (popup.type as any),
      startDate: popup.createdAt.toISOString().slice(0, 16),
      endDate: popup.expiresAt
        ? popup.expiresAt.toISOString().slice(0, 16)
        : "",
      displayDuration: 10, // Default value since we don't store this
      targetAudience: "all", // Default value since we don't store this
      priority: popup.priority,
    });
    setShowForm(true);
  };

  const handleDelete = async (popupId: string) => {
    if (window.confirm("Are you sure you want to delete this popup?")) {
      try {
        await PopupService.deletePopup(popupId);
        toast.success("Popup deleted successfully");
        loadPopups();
      } catch (error) {
        toast.error("Failed to delete popup");
        console.error("Error deleting popup:", error);
      }
    }
  };

  const handleToggleStatus = async (
    popupId: string,
    currentStatus: boolean
  ) => {
    try {
      await PopupService.updatePopup(popupId, { isActive: !currentStatus });
      toast.success(
        `Popup ${currentStatus ? "deactivated" : "activated"} successfully`
      );
      loadPopups();
    } catch (error) {
      toast.error("Failed to update popup status");
      console.error("Error updating popup status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      startDate: "",
      endDate: "",
      displayDuration: 10,
      targetAudience: "all",
      priority: 1,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "promotion":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "event":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "alert":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "promotion":
        return "🏷️";
      case "event":
        return "📅";
      case "alert":
        return "📢";
      default:
        return "ℹ️";
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case "promotion":
        return "Promotion";
      case "event":
        return "Event";
      case "alert":
        return "Announcement";
      default:
        return "Info";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-royal-cream mb-2">
            Popup Management
          </h2>
          <p className="text-royal-cream-light">
            Manage custom popup messages and notifications
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingPopup(null);
            resetForm();
          }}
          className="flex items-center space-x-2 bg-royal-gold text-royal-charcoal px-4 py-2 rounded-lg hover:bg-royal-gold-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Popup</span>
        </button>
      </div>

      {/* Popup Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-royal-cream">
              {editingPopup ? "Edit Popup" : "Create New Popup"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingPopup(null);
                resetForm();
              }}
              className="text-royal-cream-light hover:text-royal-gold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-royal-cream mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-royal-charcoal-light border border-royal-gold/20 rounded-lg px-3 py-2 text-royal-cream focus:border-royal-gold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-royal-cream mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as PopupFormData["type"],
                    })
                  }
                  className="w-full bg-royal-charcoal-light border border-royal-gold/20 rounded-lg px-3 py-2 text-royal-cream focus:border-royal-gold focus:outline-none"
                >
                  <option value="info">Info</option>
                  <option value="promo">Promotion</option>
                  <option value="event">Event</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-royal-cream mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={3}
                className="w-full bg-royal-charcoal-light border border-royal-gold/20 rounded-lg px-3 py-2 text-royal-cream focus:border-royal-gold focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-royal-cream mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full bg-royal-charcoal-light border border-royal-gold/20 rounded-lg px-3 py-2 text-royal-cream focus:border-royal-gold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-royal-cream mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full bg-royal-charcoal-light border border-royal-gold/20 rounded-lg px-3 py-2 text-royal-cream focus:border-royal-gold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-royal-cream mb-2">
                  Display Duration (seconds)
                </label>
                <input
                  type="number"
                  value={formData.displayDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayDuration: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="60"
                  className="w-full bg-royal-charcoal-light border border-royal-gold/20 rounded-lg px-3 py-2 text-royal-cream focus:border-royal-gold focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-royal-cream mb-2">
                  Target Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetAudience: e.target
                        .value as PopupFormData["targetAudience"],
                    })
                  }
                  className="w-full bg-royal-charcoal-light border border-royal-gold/20 rounded-lg px-3 py-2 text-royal-cream focus:border-royal-gold focus:outline-none"
                >
                  <option value="all">All Users</option>
                  <option value="new">New Users Only</option>
                  <option value="returning">Returning Users Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-royal-cream mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="10"
                  className="w-full bg-royal-charcoal-light border border-royal-gold/20 rounded-lg px-3 py-2 text-royal-cream focus:border-royal-gold focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPopup(null);
                  resetForm();
                }}
                className="px-4 py-2 text-royal-cream-light hover:text-royal-cream transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-royal-gold text-royal-charcoal px-4 py-2 rounded-lg hover:bg-royal-gold-dark transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{editingPopup ? "Update" : "Create"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Popups List */}
      <div className="space-y-4">
        {popups.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-royal-charcoal/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-royal-cream mb-2">
              No Popups Yet
            </h3>
            <p className="text-royal-cream-light mb-4">
              Create your first popup to start engaging with your customers
            </p>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingPopup(null);
                resetForm();
              }}
              className="flex items-center space-x-2 bg-royal-gold text-royal-charcoal px-4 py-2 rounded-lg hover:bg-royal-gold-dark transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Popup</span>
            </button>
          </div>
        ) : (
          popups.map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 hover:border-royal-gold/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getTypeIcon(popup.type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-royal-cream">
                        {popup.title}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full border ${getTypeColor(
                          popup.type
                        )}`}
                      >
                        {getTypeDisplayName(popup.type)}
                      </span>
                    </div>
                  </div>

                  <p className="text-royal-cream-light mb-4 line-clamp-2">
                    {popup.message}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-royal-gold" />
                      <span className="text-royal-cream-light">
                        {popup.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-royal-gold" />
                      <span className="text-royal-cream-light">
                        {popup.expiresAt
                          ? popup.expiresAt.toLocaleDateString()
                          : "No expiry"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-royal-gold" />
                      <span className="text-royal-cream-light">All Users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-royal-gold" />
                      <span className="text-royal-cream-light">
                        Priority: {popup.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() =>
                      handleToggleStatus(popup.id!, popup.isActive)
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      popup.isActive
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                    }`}
                    title={popup.isActive ? "Deactivate" : "Activate"}
                  >
                    {popup.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleEdit(popup)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(popup.id!)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default PopupManagement;
