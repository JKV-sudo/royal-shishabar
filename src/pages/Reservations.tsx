import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Crown, Plus, Eye, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";
import { ReservationService } from "../services/reservationService";
import { Reservation } from "../types/reservation";
import ReservationForm from "../components/reservations/ReservationForm";
import ReservationBillView from "../components/reservations/ReservationBillView";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const Reservations: React.FC = () => {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    if (user) {
      loadUserReservations();
    }
  }, [user]);

  const loadUserReservations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const reservations = await ReservationService.getUserReservations(
        user.id
      );
      setUserReservations(reservations);
    } catch (error) {
      console.error("Error loading user reservations:", error);
      toast.error("Failed to load your reservations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservationComplete = () => {
    setShowForm(false);
    loadUserReservations(); // Refresh the list
    toast.success("Reservation created successfully!");
  };

  const getStatusColor = (status: Reservation["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "seated":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no_show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "expired":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const canCancelReservation = (reservation: Reservation) => {
    const now = new Date();
    const reservationDate = new Date(reservation.date);
    const hoursUntilReservation =
      (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return (
      ["pending", "confirmed"].includes(reservation.status) &&
      hoursUntilReservation > 2
    );
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      await ReservationService.cancelReservation(
        reservationId,
        "Cancelled by customer"
      );
      toast.success("Reservation cancelled successfully");
      loadUserReservations();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast.error("Failed to cancel reservation");
    }
  };

  const renderReservationCard = (reservation: Reservation) => (
    <motion.div
      key={reservation.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-royal-charcoal rounded-royal p-6 border border-royal-gold/30 royal-glow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-royal-cream mb-2">
            Table {reservation.tableNumber}
          </h3>
          <div className="space-y-1">
            <div className="flex items-center text-royal-cream/80 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {format(reservation.date, "EEEE, dd.MM.yyyy", { locale: de })}
            </div>
            <div className="flex items-center text-royal-cream/80 text-sm">
              <Clock className="w-4 h-4 mr-2" />
              {reservation.timeSlot.replace("-", " - ")}
            </div>
            <div className="flex items-center text-royal-cream/80 text-sm">
              <Users className="w-4 h-4 mr-2" />
              {reservation.partySize}{" "}
              {reservation.partySize === 1 ? "person" : "people"}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              reservation.status
            )}`}
          >
            {formatStatus(reservation.status)}
          </span>
          {/* Hide reservation fee display */}
        </div>
      </div>

      {reservation.specialRequests && (
        <div className="mb-4 p-3 bg-royal-charcoal-dark rounded-royal border border-royal-gold/20">
          <p className="text-royal-cream/70 text-xs uppercase tracking-wide mb-1">
            Special Requests
          </p>
          <p className="text-royal-cream text-sm">
            {reservation.specialRequests}
          </p>
        </div>
      )}

      {/* Show bill view for confirmed, seated, or completed reservations */}
      {(reservation.status === "confirmed" ||
        reservation.status === "seated" ||
        reservation.status === "completed") && (
        <ReservationBillView
          reservationId={reservation.id!}
          customerName={reservation.customerName}
          tableNumber={reservation.tableNumber}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="text-royal-cream/60 text-xs">
          Reservation #{reservation.id?.slice(-8)}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedReservation(reservation)}
            className="flex items-center space-x-1 px-3 py-1 text-royal-cream hover:text-royal-gold transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          {canCancelReservation(reservation) && (
            <button
              onClick={() => cancelReservation(reservation.id!)}
              className="flex items-center space-x-1 px-3 py-1 text-red-400 hover:text-red-300 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderReservationDetails = () => {
    if (!selectedReservation) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedReservation(null)}
      >
        <div
          className="bg-royal-charcoal rounded-royal p-6 border border-royal-gold/30 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-royal font-bold text-royal-cream">
              Reservation Details
            </h2>
            <button
              onClick={() => setSelectedReservation(null)}
              className="p-2 hover:bg-royal-charcoal-dark rounded-royal transition-colors"
            >
              <X className="w-5 h-5 text-royal-cream" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-royal-cream/70 text-sm">Date</p>
                <p className="text-royal-cream font-medium">
                  {format(selectedReservation.date, "dd.MM.yyyy", {
                    locale: de,
                  })}
                </p>
              </div>
              <div>
                <p className="text-royal-cream/70 text-sm">Time</p>
                <p className="text-royal-cream font-medium">
                  {selectedReservation.timeSlot.replace("-", " - ")}
                </p>
              </div>
              <div>
                <p className="text-royal-cream/70 text-sm">Table</p>
                <p className="text-royal-cream font-medium">
                  Table {selectedReservation.tableNumber}
                </p>
              </div>
              <div>
                <p className="text-royal-cream/70 text-sm">Party Size</p>
                <p className="text-royal-cream font-medium">
                  {selectedReservation.partySize} people
                </p>
              </div>
            </div>

            <div>
              <p className="text-royal-cream/70 text-sm">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  selectedReservation.status
                )} mt-1`}
              >
                {formatStatus(selectedReservation.status)}
              </span>
            </div>

            {selectedReservation.specialRequests && (
              <div>
                <p className="text-royal-cream/70 text-sm mb-2">
                  Special Requests
                </p>
                <p className="text-royal-cream bg-royal-charcoal-dark p-3 rounded-royal border border-royal-gold/20">
                  {selectedReservation.specialRequests}
                </p>
              </div>
            )}

            {selectedReservation.totalAmount &&
              selectedReservation.totalAmount > 0 && (
                <div className="border-t border-royal-gold/30 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-royal-cream">Reservation Fee:</span>
                    <span className="text-royal-gold font-bold text-lg">
                      €{selectedReservation.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

            {/* Bill view for active reservations */}
            {(selectedReservation.status === "confirmed" ||
              selectedReservation.status === "seated" ||
              selectedReservation.status === "completed") && (
              <ReservationBillView
                reservationId={selectedReservation.id!}
                customerName={selectedReservation.customerName}
                tableNumber={selectedReservation.tableNumber}
                className="border-t border-royal-gold/30 mt-4"
              />
            )}

            <div className="text-center text-royal-cream/60 text-xs pt-4 border-t border-royal-gold/30">
              <p>Reservation ID: {selectedReservation.id}</p>
              <p>
                Created:{" "}
                {format(selectedReservation.createdAt, "dd.MM.yyyy HH:mm", {
                  locale: de,
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-royal-gradient-cream pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Crown className="w-16 h-16 text-royal-gold mx-auto mb-4" />
            <h1 className="text-3xl font-royal font-bold text-royal-charcoal mb-4">
              Login Required
            </h1>
            <p className="text-royal-charcoal/70 mb-8">
              Please log in to view and manage your reservations.
            </p>
            <a
              href="/auth"
              className="bg-royal-gradient-gold text-royal-charcoal px-8 py-3 rounded-royal font-semibold hover:shadow-lg transition-all duration-200"
            >
              Login / Register
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-royal-gradient-cream pt-20">
      <div className="container mx-auto px-4 py-8">
        {!showForm ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-royal font-bold text-royal-charcoal mb-2">
                  Your Reservations
                </h1>
                <p className="text-royal-charcoal/70">
                  Manage your table reservations at Royal Shisha Bar
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-royal-gradient-gold text-royal-charcoal px-6 py-3 rounded-royal font-semibold hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>New Reservation</span>
              </button>
            </div>

            {/* Reservations List */}
            {isLoading ? (
              <div className="flex justify-center items-center min-h-64">
                <LoadingSpinner />
              </div>
            ) : userReservations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userReservations.map(renderReservationCard)}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Calendar className="w-16 h-16 text-royal-charcoal/50 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-royal-charcoal mb-4">
                  No Reservations Yet
                </h3>
                <p className="text-royal-charcoal/70 mb-8 max-w-md mx-auto">
                  You haven't made any reservations yet. Book your table now and
                  enjoy our premium shisha experience.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-royal-gradient-gold text-royal-charcoal px-8 py-3 rounded-royal font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Make Your First Reservation
                </button>
              </motion.div>
            )}

            {/* Reservation Details Modal */}
            {renderReservationDetails()}
          </>
        ) : (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center space-x-2 text-royal-charcoal hover:text-royal-charcoal/80 transition-colors mb-4"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Back to Reservations</span>
              </button>
              <h1 className="text-4xl font-royal font-bold text-royal-charcoal mb-2">
                Make a Reservation
              </h1>
              <p className="text-royal-charcoal/70">
                Reserve your table at Royal Shisha Bar
              </p>
            </div>

            <ReservationForm
              onReservationComplete={handleReservationComplete}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
