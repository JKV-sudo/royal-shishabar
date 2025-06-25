import React, { useState, useEffect } from "react";
import { Event, EventFilters, EventStats } from "../../types/event";
import { EventService } from "../../services/eventService";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "react-hot-toast";
import EventCard from "./EventCard";
import EventForm from "./EventForm";
import LoadingSpinner from "../common/LoadingSpinner";
import { addSampleEvents } from "../../utils/sampleEvents";

const EventPlanner: React.FC = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState<EventFilters>({
    isActive: true,
  });

  const isAdmin = user?.role === "admin";

  // Predefined categories for filter
  const categories = [
    "Live Music",
    "DJ Night",
    "Special Event",
    "Holiday Celebration",
    "Themed Night",
    "VIP Event",
    "Food & Drinks",
    "Other",
  ];

  useEffect(() => {
    loadEvents();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await EventService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      toast.error("Failed to load events");
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await EventService.getEventStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm) ||
          event.category?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(
        (event) => event.category === filters.category
      );
    }

    // Apply active status filter
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(
        (event) => event.isActive === filters.isActive
      );
    }

    // Apply date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter((event) => event.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((event) => event.date <= filters.dateTo!);
    }

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEvent(null);
    loadEvents();
    loadStats();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleAddSampleEvents = async () => {
    if (!user) {
      toast.error("You must be logged in to add sample events");
      return;
    }

    try {
      setIsLoading(true);
      const success = await addSampleEvents(user.id);
      if (success) {
        toast.success("Sample events added successfully!");
        loadEvents();
        loadStats();
      } else {
        toast.error("Failed to add sample events");
      }
    } catch (error) {
      toast.error("Error adding sample events");
      console.error("Error adding sample events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      isActive: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EventForm
          event={editingEvent || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Event Planner
            </h1>
            <p className="text-gray-600">
              Discover and join amazing events at Royal Shisha Bar
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={handleAddSampleEvents}
                className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Add Sample Events
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Create Event
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalEvents}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {stats.activeEvents}
              </div>
              <div className="text-sm text-gray-600">Active Events</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {stats.upcomingEvents}
              </div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalAttendees}
              </div>
              <div className="text-sm text-gray-600">Total Attendees</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search events..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category || ""}
              onChange={(e) =>
                handleFilterChange("category", e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={
                filters.isActive === undefined
                  ? ""
                  : filters.isActive.toString()
              }
              onChange={(e) =>
                handleFilterChange(
                  "isActive",
                  e.target.value === "" ? undefined : e.target.value === "true"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Events</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={
                filters.dateFrom
                  ? filters.dateFrom.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                handleFilterChange(
                  "dateFrom",
                  e.target.value ? new Date(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Events ({filteredEvents.length})
          </h2>
          {isAdmin && (
            <div className="text-sm text-gray-600">
              Admin Mode - You can edit and manage events
            </div>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No events found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search ||
              filters.category ||
              filters.isActive !== undefined
                ? "Try adjusting your filters"
                : "Get started by creating a new event"}
            </p>
            {isAdmin &&
              !filters.search &&
              !filters.category &&
              filters.isActive === undefined && (
                <div className="mt-6 space-x-4">
                  <button
                    onClick={handleAddSampleEvents}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
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
                    Add Sample Events
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
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
                    Create Event
                  </button>
                </div>
              )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="relative">
                <EventCard
                  event={event}
                  onUpdate={loadEvents}
                  showAdminControls={isAdmin}
                />
                {isAdmin && (
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    title="Edit Event"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPlanner;
