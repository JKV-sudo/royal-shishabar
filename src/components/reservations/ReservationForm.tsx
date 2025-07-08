import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Crown,
  Star,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ReservationService } from "../../services/reservationService";
import { useAuthStore } from "../../stores/authStore";
import {
  ReservationFormData,
  AvailableTable,
  TimeSlot,
  AvailabilityCheck,
} from "../../types/reservation";
import LoadingSpinner from "../common/LoadingSpinner";
import DataProcessingConsent from "../gdpr/DataProcessingConsent";

interface ReservationFormProps {
  onReservationComplete?: (reservationId: string) => void;
  onCancel?: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  onReservationComplete,
  onCancel,
}) => {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTable, setSelectedTable] = useState<AvailableTable | null>(
    null
  );
  const [hasDataProcessingConsent, setHasDataProcessingConsent] =
    useState(false);

  const [formData, setFormData] = useState<ReservationFormData>({
    date: "",
    timeSlot: "",
    partySize: 2,
    customerName: user?.name || "",
    customerEmail: user?.email || "",
    customerPhone: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTimeSlots();
  }, []);

  useEffect(() => {
    // console.log(
    //   "🔄 timeSlots state changed:",
    //   timeSlots.map((s) => `${s.startTime}-${s.endTime}`)
    // );
  }, [timeSlots]);

  const loadTimeSlots = async () => {
    try {
      const slots = await ReservationService.getTimeSlots();
      const activeSlots = slots.filter((slot) => slot.isActive);

      // Sort by start time with proper restaurant time handling
      const sortedSlots = activeSlots.sort((a, b) => {
        const [hourA, minuteA] = a.startTime.split(":").map(Number);
        const [hourB, minuteB] = b.startTime.split(":").map(Number);

        // Convert to minutes, treating midnight hours (0-6) as later in the day
        let timeA = hourA * 60 + minuteA;
        let timeB = hourB * 60 + minuteB;

        // If hour is 0-6 (midnight to 6 AM), add 24 hours to make it later
        if (hourA < 7) timeA += 24 * 60;
        if (hourB < 7) timeB += 24 * 60;

        return timeA - timeB;
      });

      setTimeSlots(sortedSlots);
    } catch (error) {
      console.error("Error loading time slots:", error);
      toast.error("Failed to load available time slots");
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.date) newErrors.date = "Please select a date";
      if (!formData.timeSlot) newErrors.timeSlot = "Please select a time slot";
      if (formData.partySize < 1 || formData.partySize > 8) {
        newErrors.partySize = "Party size must be between 1 and 12";
      }
    }

    if (stepNumber === 2) {
      if (!selectedTable) newErrors.table = "Please select a table";
    }

    if (stepNumber === 3) {
      if (!formData.customerName.trim())
        newErrors.customerName = "Name is required";
      if (!formData.customerEmail.trim())
        newErrors.customerEmail = "Email is required";
      if (!formData.customerPhone.trim())
        newErrors.customerPhone = "Phone number is required";

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.customerEmail && !emailRegex.test(formData.customerEmail)) {
        newErrors.customerEmail = "Please enter a valid email address";
      }

      // GDPR consent validation
      if (!hasDataProcessingConsent) {
        newErrors.consent =
          "Data processing consent is required to create a reservation";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAvailability = async () => {
    if (!validateStep(1)) return;

    setIsLoading(true);
    try {
      const availabilityCheck: AvailabilityCheck = {
        date: new Date(formData.date),
        timeSlot: formData.timeSlot,
        partySize: formData.partySize,
      };

      const tables = await ReservationService.getAvailableTables(
        availabilityCheck
      );
      setAvailableTables(tables);
      setStep(2);
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("Failed to check availability");
    } finally {
      setIsLoading(false);
    }
  };

  const selectTable = (table: AvailableTable) => {
    setSelectedTable(table);
    setFormData((prev) => ({ ...prev, tableId: table.table.id }));
    setStep(3);
  };

  const submitReservation = async () => {
    if (!validateStep(3) || !user) return;

    setIsLoading(true);
    try {
      const reservationId = await ReservationService.createReservation(
        formData,
        user.id
      );
      toast.success("Reservation created successfully!");
      onReservationComplete?.(reservationId);
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      toast.error(error.message || "Failed to create reservation");
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case "vip":
        return <Crown className="w-4 h-4" />;
      case "outdoor":
        return <Star className="w-4 h-4" />;
      case "indoor":
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getLocationColor = (location: string) => {
    switch (location) {
      case "vip":
        return "text-royal-gold";
      case "outdoor":
        return "text-green-400";
      case "indoor":
      default:
        return "text-royal-cream";
    }
  };

  const getLocationDisplayName = (location: string) => {
    switch (location) {
      case "vip":
        return "VIP Bereich";
      case "outdoor":
        return "Außenbereich";
      case "indoor":
      default:
        return "Innenbereich";
    }
  };

  const isLocationOpenForTimeSlot = (location: string, timeSlot: string) => {
    if (location === "outdoor") {
      const endTime = timeSlot.split("-")[1];
      const endHour = parseInt(endTime.split(":")[0]);
      // Outdoor closes at 22:00
      return !(endHour > 22 || endHour < 6);
    }
    return true;
  };

  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot.replace("-", " - ");
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days in advance
    return maxDate.toISOString().split("T")[0];
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-royal font-bold text-royal-cream mb-2">
          Select Date & Time
        </h2>
        <p className="text-royal-cream/70">
          Choose your preferred date, time, and party size
        </p>
        <div className="mt-3 p-3 bg-blue-900/30 border border-blue-500/50 rounded-royal">
          <p className="text-blue-200 text-sm">
            ℹ️ Reservierungen sind kostenlos. Maximal 2 aktive Reservierungen
            pro Konto.
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-royal-cream font-medium">
          <Calendar className="w-4 h-4" />
          <span>Date *</span>
        </label>
        <input
          type="date"
          value={formData.date}
          min={getMinDate()}
          max={getMaxDate()}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, date: e.target.value }))
          }
          className="w-full p-3 border border-royal-gold/30 rounded-royal bg-royal-charcoal text-royal-cream focus:outline-none focus:ring-2 focus:ring-royal-gold/50"
        />
        {errors.date && (
          <p className="text-red-400 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.date}
          </p>
        )}
      </div>

      {/* Time Slot Selection */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-royal-cream font-medium">
          <Clock className="w-4 h-4" />
          <span>Time Slot *</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  timeSlot: `${slot.startTime}-${slot.endTime}`,
                }))
              }
              className={`p-3 rounded-royal border-2 transition-all duration-200 ${
                formData.timeSlot === `${slot.startTime}-${slot.endTime}`
                  ? "border-royal-gold bg-royal-gold/10 text-royal-gold"
                  : "border-royal-gold/30 bg-royal-charcoal text-royal-cream hover:border-royal-gold/50"
              }`}
            >
              <div className="text-center">
                <div className="font-medium">
                  {slot.startTime} - {slot.endTime}
                </div>
                <div className="text-xs opacity-70">
                  {slot.duration} minutes
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.timeSlot && (
          <p className="text-red-400 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.timeSlot}
          </p>
        )}
      </div>

      {/* Party Size */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-royal-cream font-medium">
          <Users className="w-4 h-4" />
          <span>Party Size *</span>
        </label>
        <select
          value={formData.partySize}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              partySize: parseInt(e.target.value),
            }))
          }
          className="w-full p-3 border border-royal-gold/30 rounded-royal bg-royal-charcoal text-royal-cream focus:outline-none focus:ring-2 focus:ring-royal-gold/50"
        >
          {Array.from({ length: 8 }, (_, i) => i + 1).map((size) => (
            <option key={size} value={size}>
              {size} {size === 1 ? "Person" : "People"}
            </option>
          ))}
        </select>
        {errors.partySize && (
          <p className="text-red-400 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.partySize}
          </p>
        )}
      </div>

      <button
        onClick={checkAvailability}
        disabled={isLoading}
        className="w-full bg-royal-gradient-gold text-royal-charcoal py-3 px-6 rounded-royal font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? <LoadingSpinner /> : "Check Availability"}
      </button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-royal font-bold text-royal-cream mb-2">
          Select Your Table
        </h2>
        <p className="text-royal-cream/70">
          {formData.date} • {formatTimeSlot(formData.timeSlot)} •{" "}
          {formData.partySize} {formData.partySize === 1 ? "person" : "people"}
        </p>
      </div>

      {/* Outdoor area closing notice */}
      {!isLocationOpenForTimeSlot("outdoor", formData.timeSlot) && (
        <div className="bg-amber-900/30 border border-amber-500/50 rounded-royal p-4 mb-4">
          <div className="flex items-center space-x-2 text-amber-300">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Hinweis:</span>
          </div>
          <p className="text-amber-200 text-sm mt-1">
            Der Außenbereich schließt um 22:00 Uhr. Für diese Uhrzeit sind nur
            Tische im Innenbereich verfügbar.
          </p>
        </div>
      )}

      {availableTables.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-royal-cream/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-royal-cream mb-2">
            No Tables Available
          </h3>
          <p className="text-royal-cream/70 mb-4">
            Sorry, no tables are available for your selected time and party
            size.
          </p>
          <button
            onClick={() => setStep(1)}
            className="bg-royal-gradient-gold text-royal-charcoal py-2 px-6 rounded-royal font-semibold hover:shadow-lg transition-all duration-200"
          >
            Try Different Time
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableTables.map((availableTable) => (
            <motion.button
              key={availableTable.table.id}
              onClick={() => selectTable(availableTable)}
              disabled={!availableTable.available}
              className={`p-4 rounded-royal border-2 text-left transition-all duration-200 ${
                availableTable.available
                  ? "border-royal-gold/30 bg-royal-charcoal hover:border-royal-gold hover:bg-royal-gold/5"
                  : "border-red-400/30 bg-red-900/20 opacity-50 cursor-not-allowed"
              }`}
              whileHover={availableTable.available ? { scale: 1.02 } : {}}
              whileTap={availableTable.available ? { scale: 0.98 } : {}}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getLocationIcon(availableTable.table.location)}
                  <span className="font-semibold text-royal-cream">
                    Table {availableTable.table.number}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-sm">
                    KOSTENLOS
                  </div>
                  <div className="text-xs text-royal-cream/70">
                    keine Reservierungsgebühr
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-royal-cream/70">Capacity:</span>
                  <span className="text-royal-cream">
                    {availableTable.table.capacity} people
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-royal-cream/70">Location:</span>
                  <span
                    className={`capitalize ${getLocationColor(
                      availableTable.table.location
                    )}`}
                  >
                    {getLocationDisplayName(availableTable.table.location)}
                  </span>
                </div>
                {availableTable.table.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {availableTable.table.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-1 bg-royal-gold/20 text-royal-gold text-xs rounded-full"
                      >
                        {amenity.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {!availableTable.available && (
                <div className="mt-2 text-red-400 text-sm font-medium">
                  Not Available
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-royal-charcoal-dark text-royal-cream py-3 px-6 rounded-royal font-semibold border border-royal-gold/30 hover:bg-royal-charcoal transition-all duration-200"
        >
          Back
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-royal font-bold text-royal-cream mb-2">
          Confirm Your Details
        </h2>
        <p className="text-royal-cream/70">
          Please provide your contact information
        </p>
      </div>

      {/* Reservation Summary */}
      {selectedTable && (
        <div className="bg-royal-charcoal-dark rounded-royal p-4 border border-royal-gold/30">
          <h3 className="font-semibold text-royal-cream mb-3">
            Reservation Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-royal-cream/70">Date:</span>
              <span className="text-royal-cream">
                {new Date(formData.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-royal-cream/70">Time:</span>
              <span className="text-royal-cream">
                {formatTimeSlot(formData.timeSlot)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-royal-cream/70">Table:</span>
              <span className="text-royal-cream">
                Table {selectedTable.table.number} (
                {selectedTable.table.location})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-royal-cream/70">Party Size:</span>
              <span className="text-royal-cream">
                {formData.partySize} people
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t border-royal-gold/30 pt-2">
              <span className="text-royal-cream">Reservierung:</span>
              <span className="text-green-400">KOSTENLOS</span>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-royal-cream font-medium">Full Name *</label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customerName: e.target.value }))
            }
            className="w-full p-3 border border-royal-gold/30 rounded-royal bg-royal-charcoal text-royal-cream focus:outline-none focus:ring-2 focus:ring-royal-gold/50"
            placeholder="Enter your full name"
          />
          {errors.customerName && (
            <p className="text-red-400 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.customerName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-royal-cream font-medium">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customerEmail: e.target.value,
              }))
            }
            className="w-full p-3 border border-royal-gold/30 rounded-royal bg-royal-charcoal text-royal-cream focus:outline-none focus:ring-2 focus:ring-royal-gold/50"
            placeholder="Enter your email address"
          />
          {errors.customerEmail && (
            <p className="text-red-400 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.customerEmail}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-royal-cream font-medium">Phone Number *</label>
          <input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customerPhone: e.target.value,
              }))
            }
            className="w-full p-3 border border-royal-gold/30 rounded-royal bg-royal-charcoal text-royal-cream focus:outline-none focus:ring-2 focus:ring-royal-gold/50"
            placeholder="Enter your phone number"
          />
          {errors.customerPhone && (
            <p className="text-red-400 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.customerPhone}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-royal-cream font-medium">
            Special Requests
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                specialRequests: e.target.value,
              }))
            }
            className="w-full p-3 border border-royal-gold/30 rounded-royal bg-royal-charcoal text-royal-cream focus:outline-none focus:ring-2 focus:ring-royal-gold/50 h-20 resize-none"
            placeholder="Any special requests or dietary requirements..."
          />
        </div>
      </div>

      {/* GDPR Data Processing Consent */}
      <div className="space-y-4">
        <DataProcessingConsent
          purpose="reservation_processing"
          required={true}
          onConsentChange={setHasDataProcessingConsent}
          description="We need to process your personal data to create and manage your reservation."
        />

        {errors.consent && (
          <p className="text-red-400 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-royal-charcoal-dark text-royal-cream py-3 px-6 rounded-royal font-semibold border border-royal-gold/30 hover:bg-royal-charcoal transition-all duration-200"
        >
          Back
        </button>
        <button
          onClick={submitReservation}
          disabled={isLoading || !hasDataProcessingConsent}
          className="flex-1 bg-royal-gradient-gold text-royal-charcoal py-3 px-6 rounded-royal font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <LoadingSpinner /> : "Confirm Reservation"}
        </button>
      </div>
    </motion.div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= stepNumber
                ? "bg-royal-gold text-royal-charcoal"
                : "bg-royal-charcoal-dark text-royal-cream border border-royal-gold/30"
            }`}
          >
            {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
          </div>
          {stepNumber < 3 && (
            <div
              className={`w-12 h-0.5 mx-2 ${
                step > stepNumber ? "bg-royal-gold" : "bg-royal-gold/30"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (!user) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-royal-cream/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-royal-cream mb-2">
          Login Required
        </h3>
        <p className="text-royal-cream/70">
          Please log in to make a reservation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {renderStepIndicator()}

      <div className="bg-royal-charcoal rounded-royal p-6 border border-royal-gold/30 royal-glow">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {onCancel && (
        <div className="text-center mt-6">
          <button
            onClick={onCancel}
            className="text-royal-cream/70 hover:text-royal-cream transition-colors"
          >
            Cancel Reservation
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
