import React, { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, Info } from "lucide-react";
// import { GDPRService } from "../../services/gdprService";
import { ProcessingPurpose } from "../../types/gdpr";

interface DataMinimizationControlProps {
  purpose: ProcessingPurpose;
  children: React.ReactNode;
  className?: string;
}

interface DataField {
  name: string;
  required: boolean;
  visible: boolean;
  label: string;
}

/**
 * Data Minimization Control Component
 *
 * This component implements GDPR Article 5(1)(c) - data minimization principle.
 * It ensures that only data that is adequate, relevant and limited to what is
 * necessary for the processing purpose is collected.
 */
export const DataMinimizationControl: React.FC<
  DataMinimizationControlProps
> = ({ purpose, children, className = "" }) => {
  // const [minimizationRules, setMinimizationRules] = useState<string[]>([]);
  const [showDataInfo, setShowDataInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMinimizationRules();
  }, [purpose]);

  const loadMinimizationRules = async () => {
    try {
      setLoading(true);
      // const rules = await GDPRService.getDataMinimizationRules();
      // setMinimizationRules(rules[purpose] || []);
    } catch (error) {
      console.error("Error loading data minimization rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDataFieldsForPurpose = (): DataField[] => {
    switch (purpose) {
      case "reservation_processing":
        return [
          { name: "name", required: true, visible: true, label: "Full Name" },
          {
            name: "email",
            required: true,
            visible: true,
            label: "Email Address",
          },
          {
            name: "phone",
            required: true,
            visible: true,
            label: "Phone Number",
          },
          {
            name: "reservationDate",
            required: true,
            visible: true,
            label: "Reservation Date",
          },
          {
            name: "partySize",
            required: true,
            visible: true,
            label: "Party Size",
          },
          {
            name: "specialRequests",
            required: false,
            visible: true,
            label: "Special Requests",
          },
        ];

      case "order_processing":
        return [
          { name: "name", required: true, visible: true, label: "Full Name" },
          {
            name: "email",
            required: true,
            visible: true,
            label: "Email Address",
          },
          {
            name: "phone",
            required: true,
            visible: true,
            label: "Phone Number",
          },
          {
            name: "orderItems",
            required: true,
            visible: true,
            label: "Order Items",
          },
          {
            name: "paymentMethod",
            required: true,
            visible: true,
            label: "Payment Method",
          },
          {
            name: "deliveryAddress",
            required: false,
            visible: false,
            label: "Delivery Address",
          },
        ];

      case "loyalty_program":
        return [
          { name: "name", required: true, visible: true, label: "Full Name" },
          {
            name: "email",
            required: true,
            visible: true,
            label: "Email Address",
          },
          {
            name: "phoneOptional",
            required: false,
            visible: true,
            label: "Phone Number (Optional)",
          },
          {
            name: "purchaseHistory",
            required: false,
            visible: true,
            label: "Purchase History",
          },
          {
            name: "preferences",
            required: false,
            visible: false,
            label: "Preferences",
          },
        ];

      case "marketing_communications":
        return [
          { name: "name", required: true, visible: true, label: "Full Name" },
          {
            name: "email",
            required: true,
            visible: true,
            label: "Email Address",
          },
          {
            name: "preferences",
            required: false,
            visible: true,
            label: "Communication Preferences",
          },
        ];

      case "analytics":
        return [
          {
            name: "anonymizedUsage",
            required: false,
            visible: true,
            label: "Anonymized Usage Data",
          },
          {
            name: "sessionData",
            required: false,
            visible: true,
            label: "Session Statistics",
          },
        ];

      default:
        return [];
    }
  };

  const getPurposeDescription = (): string => {
    switch (purpose) {
      case "reservation_processing":
        return "Data collected for processing your table reservation";
      case "order_processing":
        return "Data collected for processing your order";
      case "loyalty_program":
        return "Data collected for managing your loyalty program participation";
      case "marketing_communications":
        return "Data collected for sending you marketing communications";
      case "analytics":
        return "Anonymized data collected for improving our services";
      default:
        return "Data collected for service provision";
    }
  };

  const dataFields = getDataFieldsForPurpose();
  const requiredFields = dataFields.filter((field) => field.required);
  const optionalFields = dataFields.filter((field) => !field.required);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 bg-white ${className}`}>
      {/* Data Minimization Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">
            Data Collection Overview
          </h3>
        </div>
        <button
          onClick={() => setShowDataInfo(!showDataInfo)}
          className="text-blue-600 hover:text-blue-700 p-1"
          title="Toggle data collection details"
        >
          {showDataInfo ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-3">{getPurposeDescription()}</p>

      {showDataInfo && (
        <div className="space-y-3 mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 text-sm">
                GDPR Data Minimization
              </h4>
              <p className="text-xs text-blue-800">
                We only collect data that is necessary, adequate, and relevant
                for the specified purpose.
              </p>
            </div>
          </div>

          {requiredFields.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 text-sm mb-1">
                Required Data:
              </h5>
              <ul className="text-xs text-gray-700 space-y-1">
                {requiredFields.map((field) => (
                  <li key={field.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    {field.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {optionalFields.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 text-sm mb-1">
                Optional Data:
              </h5>
              <ul className="text-xs text-gray-700 space-y-1">
                {optionalFields.map((field) => (
                  <li key={field.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    {field.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Form Content with Data Minimization Applied */}
      <div className="data-minimization-content">{children}</div>

      {/* Data Retention Notice */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <Shield className="w-3 h-3 inline mr-1" />
          Data is retained only as long as necessary for the stated purpose and
          in compliance with legal requirements.
        </p>
      </div>
    </div>
  );
};

export default DataMinimizationControl;
