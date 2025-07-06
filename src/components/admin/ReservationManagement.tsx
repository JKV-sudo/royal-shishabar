import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Crown,
  Star,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ReservationService } from "../../services/reservationService";
import { Reservation } from "../../types/reservation";
import LoadingSpinner from "../common/LoadingSpinner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const ReservationManagement: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    loadReservations();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  const loadReservations = async () => {
    try {
      setIsLoading(true);
      const data = await ReservationService.getReservations();
      setReservations(data);
    } catch (error) {
      console.error("Error loading reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setIsLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customerName.toLowerCase().includes(term) ||
          r.customerEmail.toLowerCase().includes(term) ||
          r.customerPhone.toLowerCase().includes(term) ||
          r.tableNumber.toString().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case "today": {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          filtered = filtered.filter(
            (r) => r.date >= today && r.date < tomorrow
          );
          break;
        }
        case "upcoming":
          filtered = filtered.filter(
            (r) =>
              r.date >= today && ["pending", "confirmed"].includes(r.status)
          );
          break;
        case "past":
          filtered = filtered.filter((r) => r.date < today);
          break;
      }
    }

    setFilteredReservations(filtered);
  };

  const updateReservationStatus = async (
    reservationId: string,
    status: Reservation["status"]
  ) => {
    try {
      await ReservationService.updateReservationStatus(reservationId, status);
      toast.success(`Reservation ${status} successfully`);
      loadReservations();
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Failed to update reservation");
    }
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

  const getLocationIcon = (reservation: Reservation) => {
    // Determine location based on table number ranges
    if (reservation.tableNumber === 20)
      return <Crown className="w-4 h-4 text-yellow-500" />; // VIP
    if (reservation.tableNumber >= 21 && reservation.tableNumber <= 30)
      return <Star className="w-4 h-4 text-green-500" />; // Außenbereich
    return <MapPin className="w-4 h-4 text-blue-500" />; // Innenbereich
  };

  const getLocationDisplayName = (tableNumber: number) => {
    if (tableNumber === 20) return "VIP Bereich";
    if (tableNumber >= 21 && tableNumber <= 30) return "Außenbereich";
    return "Innenbereich";
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderReservationCard = (reservation: Reservation) => (
    <motion.div
      key={reservation.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getLocationIcon(reservation)}
          <div>
            <h3 className="font-semibold text-gray-900">
              Table {reservation.tableNumber} •{" "}
              {getLocationDisplayName(reservation.tableNumber)}
            </h3>
            <p className="text-sm text-gray-600">{reservation.customerName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              reservation.status
            )}`}
          >
            {formatStatus(reservation.status)}
          </span>
          <button
            onClick={() => setSelectedReservation(reservation)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {format(reservation.date, "dd.MM.yyyy", { locale: de })}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          {reservation.timeSlot.replace("-", " - ")}
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          {reservation.partySize} people
        </div>
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          {reservation.customerPhone}
        </div>
      </div>

      {reservation.specialRequests && (
        <div className="p-2 bg-gray-50 rounded text-sm text-gray-700 mb-3">
          <strong>Special Requests:</strong> {reservation.specialRequests}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          #{reservation.id?.slice(-8)}
        </div>
        <div className="flex space-x-2">
          {reservation.status === "pending" && (
            <>
              <button
                onClick={() =>
                  updateReservationStatus(reservation.id!, "confirmed")
                }
                className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm</span>
              </button>
              <button
                onClick={() =>
                  updateReservationStatus(reservation.id!, "cancelled")
                }
                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </>
          )}
          {reservation.status === "confirmed" && (
            <>
              <button
                onClick={() =>
                  updateReservationStatus(reservation.id!, "seated")
                }
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Seated</span>
              </button>
              <button
                onClick={() =>
                  updateReservationStatus(reservation.id!, "no_show")
                }
                className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>No Show</span>
              </button>
            </>
          )}
          {reservation.status === "seated" && (
            <button
              onClick={() =>
                updateReservationStatus(reservation.id!, "completed")
              }
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete</span>
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
          className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Reservation Details
            </h2>
            <button
              onClick={() => setSelectedReservation(null)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Customer</p>
                <p className="font-semibold">
                  {selectedReservation.customerName}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Table</p>
                <p className="font-semibold">
                  Table {selectedReservation.tableNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Date</p>
                <p className="font-semibold">
                  {format(selectedReservation.date, "EEEE, dd.MM.yyyy", {
                    locale: de,
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Time</p>
                <p className="font-semibold">
                  {selectedReservation.timeSlot.replace("-", " - ")}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Party Size</p>
                <p className="font-semibold">
                  {selectedReservation.partySize} people
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    selectedReservation.status
                  )}`}
                >
                  {formatStatus(selectedReservation.status)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-sm">Contact</p>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    {selectedReservation.customerEmail}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    {selectedReservation.customerPhone}
                  </span>
                </div>
              </div>
            </div>

            {selectedReservation.specialRequests && (
              <div>
                <p className="text-gray-600 text-sm">Special Requests</p>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {selectedReservation.specialRequests}
                </p>
              </div>
            )}

            {selectedReservation.totalAmount && (
              <div>
                <p className="text-gray-600 text-sm">Total Amount</p>
                <p className="font-semibold text-lg text-green-600">
                  €{selectedReservation.totalAmount.toFixed(2)}
                </p>
              </div>
            )}

            <div>
              <p className="text-gray-600 text-sm">Created</p>
              <p className="text-sm">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Reservation Management
          </h2>
          <p className="text-gray-300">
            Manage table reservations and customer bookings
          </p>
        </div>
        <button
          onClick={loadReservations}
          className="flex items-center space-x-2 bg-royal-gold text-royal-charcoal px-4 py-2 rounded-lg hover:bg-royal-gold/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold/50 focus:border-royal-gold"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold/50 focus:border-royal-gold"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="seated">Seated</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold/50 focus:border-royal-gold"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {reservations.length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reservations.filter((r) => r.status === "pending").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">
                {reservations.filter((r) => r.status === "confirmed").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  reservations.filter((r) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return r.date >= today && r.date < tomorrow;
                  }).length
                }
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Reservations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Reservations Found
          </h3>
          <p className="text-gray-400">
            {reservations.length === 0
              ? "No reservations have been made yet."
              : "No reservations match your current filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReservations.map(renderReservationCard)}
        </div>
      )}

      {/* Reservation Details Modal */}
      {renderReservationDetails()}
    </div>
  );
};

export default ReservationManagement;
