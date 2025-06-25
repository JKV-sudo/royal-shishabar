import React from "react";
import { Event } from "../../types/event";
import { EventService } from "../../services/eventService";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  onUpdate?: () => void;
  showAdminControls?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onUpdate,
  showAdminControls = false,
}) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAttending, setIsAttending] = React.useState(
    event.attendees?.includes(user?.id || "") || false
  );

  const handleToggleAttendance = async () => {
    if (!user) {
      toast.error("Please log in to attend events");
      return;
    }

    setIsLoading(true);
    try {
      await EventService.toggleAttendance(event.id, user.id);
      setIsAttending(!isAttending);
      toast.success(isAttending ? "Removed from event" : "Added to event");
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to update attendance");
      console.error("Error toggling attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      await EventService.toggleEventStatus(event.id, !event.isActive);
      toast.success(`Event ${event.isActive ? "deactivated" : "activated"}`);
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to update event status");
      console.error("Error toggling status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setIsLoading(true);
    try {
      await EventService.deleteEvent(event.id);
      toast.success("Event deleted successfully");
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to delete event");
      console.error("Error deleting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "MMM dd, yyyy");
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
        !event.isActive ? "opacity-75" : ""
      }`}
    >
      {/* Event Image */}
      {event.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Event Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {event.title}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg
                className="w-4 h-4 mr-2"
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
              {formatDate(event.date)} at {formatTime(event.time)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {event.location}
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              event.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {event.isActive ? "Active" : "Inactive"}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>

        {/* Event Details */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
          {event.category && (
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              {event.category}
            </div>
          )}
          {event.price !== undefined && (
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              ${event.price}
            </div>
          )}
          {event.capacity && (
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {event.attendees?.length || 0}/{event.capacity} attendees
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleToggleAttendance}
              disabled={isLoading || !event.isActive}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isAttending
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } ${
                !event.isActive || isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : isAttending ? (
                "Leave Event"
              ) : (
                "Join Event"
              )}
            </button>
          </div>

          {/* Admin Controls */}
          {showAdminControls && (
            <div className="flex gap-2">
              <button
                onClick={handleToggleStatus}
                disabled={isLoading}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  event.isActive
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {event.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
