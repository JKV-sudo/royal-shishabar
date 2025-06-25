import React, { useState, useEffect } from "react";
import { Event, EventFormData } from "../../types/event";
import { EventService } from "../../services/eventService";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import ImageUpload from "../common/ImageUpload";

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    imageUrl: "",
    price: undefined,
    capacity: undefined,
    category: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  // Predefined categories with icons
  const categories = [
    { value: "Live Music", label: "Live Music", icon: "🎵" },
    { value: "DJ Night", label: "DJ Night", icon: "🎧" },
    { value: "Special Event", label: "Special Event", icon: "⭐" },
    { value: "Holiday Celebration", label: "Holiday Celebration", icon: "🎉" },
    { value: "Themed Night", label: "Themed Night", icon: "🎭" },
    { value: "VIP Event", label: "VIP Event", icon: "👑" },
    { value: "Food & Drinks", label: "Food & Drinks", icon: "🍹" },
    { value: "Other", label: "Other", icon: "📅" },
  ];

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        date: format(event.date, "yyyy-MM-dd"),
        time: event.time,
        location: event.location,
        imageUrl: event.imageUrl || "",
        price: event.price,
        capacity: event.capacity,
        category: event.category || "",
        tags: event.tags || [],
      });
    }
  }, [event]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "capacity"
          ? value
            ? Number(value)
            : undefined
          : value,
    }));
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create events");
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      toast.error("Event title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Event description is required");
      return;
    }
    if (!formData.date) {
      toast.error("Event date is required");
      return;
    }
    if (!formData.time) {
      toast.error("Event time is required");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Event location is required");
      return;
    }

    setIsLoading(true);
    try {
      if (event) {
        // Update existing event
        await EventService.updateEvent(event.id, formData);
        toast.success("Event updated successfully");
      } else {
        // Create new event
        await EventService.createEvent(formData, user.id);
        toast.success("Event created successfully");
      }
      onSuccess?.();
    } catch (error) {
      toast.error(event ? "Failed to update event" : "Failed to create event");
      console.error("Error saving event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {event ? "Edit Event" : "Create New Event"}
                </h1>
                <p className="text-purple-100 mt-1">
                  {event
                    ? "Update your event details"
                    : "Share your amazing event with the world"}
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Upload Section */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Event Image
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={handleImageChange}
                  className="max-w-md"
                />
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Event Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter a captivating event title"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Where is your event taking place?"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Date *
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="time"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Time *
                      </label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Price and Capacity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={formData.price || ""}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="capacity"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Capacity
                      </label>
                      <input
                        type="number"
                        id="capacity"
                        name="capacity"
                        value={formData.capacity || ""}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell people about your amazing event..."
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Add tags to help people find your event"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 text-sm rounded-full font-medium"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-purple-600 hover:text-purple-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : event ? (
                    "Update Event"
                  ) : (
                    "Create Event"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
