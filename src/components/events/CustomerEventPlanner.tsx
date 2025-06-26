import React, { useState, useEffect, useCallback } from "react";
import { Event, EventFilters } from "../../types/event";
import { EventService } from "../../services/eventService";
import { toast } from "react-hot-toast";
import SimpleEventCard from "./SimpleEventCard";
import LoadingSpinner from "../common/LoadingSpinner";

const CustomerEventPlanner: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    isActive: true, // Only show active events for customers
  });

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
  }, []);

  const applyFilters = useCallback(() => {
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

    // Apply date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter((event) => event.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((event) => event.date <= filters.dateTo!);
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await EventService.getEvents({ isActive: true }); // Only load active events
      setEvents(eventsData);
    } catch (error) {
      toast.error("Failed to load events");
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (
    key: keyof EventFilters,
    value: string | Date | undefined
  ) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-royal-cream mb-2">
          Upcoming Events
        </h1>
        <p className="text-royal-cream/70">
          Discover amazing events at Royal Shisha Bar
        </p>
      </div>

      {/* Simple Filters */}
      <div className="bg-royal-charcoal-dark rounded-royal shadow-lg p-6 mb-8 border border-royal-gold/30 royal-glow">
        <h2 className="text-xl font-semibold text-royal-cream mb-4">
          Find Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-royal-cream mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search events..."
              className="w-full px-3 py-2 border border-royal-gold/30 rounded-royal focus:ring-2 focus:ring-royal-gold/50 focus:border-transparent bg-royal-charcoal text-royal-cream"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-royal-cream mb-2">
              Category
            </label>
            <select
              value={filters.category || ""}
              onChange={(e) =>
                handleFilterChange("category", e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-royal-gold/30 rounded-royal focus:ring-2 focus:ring-royal-gold/50 focus:border-transparent bg-royal-charcoal text-royal-cream"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-royal-cream mb-2">
              From Date
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
              className="w-full px-3 py-2 border border-royal-gold/30 rounded-royal focus:ring-2 focus:ring-royal-gold/50 focus:border-transparent bg-royal-charcoal text-royal-cream"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-royal-gold hover:text-royal-gold/80 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-royal-cream">
            Events ({filteredEvents.length})
          </h2>
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
              {filters.search || filters.category || filters.dateFrom
                ? "Try adjusting your filters"
                : "Check back soon for upcoming events"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <SimpleEventCard
                key={event.id}
                event={event}
                onUpdate={loadEvents}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerEventPlanner;
