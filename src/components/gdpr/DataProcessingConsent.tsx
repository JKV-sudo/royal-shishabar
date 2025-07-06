import React, { useState, useEffect } from "react";
import { Shield, Check, AlertTriangle, Info } from "lucide-react";
import { GDPRService } from "../../services/gdprService";
import { useAuthStore } from "../../stores/authStore";
import { ConsentRecord, ProcessingPurpose } from "../../types/gdpr";

interface DataProcessingConsentProps {
  purpose: ProcessingPurpose;
  onConsentChange: (granted: boolean) => void;
  required?: boolean;
  description?: string;
  children?: React.ReactNode;
}

interface ConsentModalProps {
  isOpen: boolean;
  purpose: ProcessingPurpose;
  onConsent: (granted: boolean) => void;
  onClose: () => void;
  required?: boolean;
}

const ProcessingPurposeDescriptions = {
  reservation_processing: {
    title: "Reservierungsverarbeitung",
    description:
      "Wir verarbeiten Ihre persönlichen Daten (Name, E-Mail, Telefon) um Ihre Tischreservierung zu bearbeiten und zu bestätigen.",
    legalBasis: "Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)",
    dataTypes: [
      "Name",
      "E-Mail-Adresse",
      "Telefonnummer",
      "Reservierungsdetails",
    ],
    retention: "3 Jahre nach dem Reservierungsdatum für buchhalterische Zwecke",
  },
  order_processing: {
    title: "Bestellungsverarbeitung",
    description:
      "Wir verarbeiten Ihre Daten um Ihre Bestellung zu bearbeiten, die Zahlung zu verarbeiten und die Lieferung zu koordinieren.",
    legalBasis: "Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)",
    dataTypes: [
      "Name",
      "E-Mail-Adresse",
      "Telefonnummer",
      "Bestelldetails",
      "Zahlungsinformationen",
    ],
    retention: "10 Jahre für steuerliche und buchhalterische Zwecke",
  },
  loyalty_program: {
    title: "Treueprogramm",
    description:
      "Wir verarbeiten Ihre Daten um Treuepunkte zu verwalten, personalisierte Angebote zu erstellen und Belohnungen zu verwalten.",
    legalBasis: "Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)",
    dataTypes: ["Name", "E-Mail-Adresse", "Kaufhistorie", "Präferenzen"],
    retention:
      "Bis zum Widerruf der Einwilligung oder 2 Jahre nach der letzten Aktivität",
  },
  marketing_communications: {
    title: "Marketing-Kommunikation",
    description:
      "Wir möchten Ihnen Informationen über neue Angebote, Veranstaltungen und Promotionen senden.",
    legalBasis: "Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)",
    dataTypes: ["Name", "E-Mail-Adresse", "Präferenzen"],
    retention: "Bis zum Widerruf der Einwilligung",
  },
  analytics: {
    title: "Analyse und Verbesserung",
    description:
      "Wir analysieren die Nutzung unserer Dienste um diese zu verbessern und zu optimieren.",
    legalBasis: "Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)",
    dataTypes: ["Nutzungsstatistiken", "Anonymisierte Verhaltensdaten"],
    retention: "2 Jahre in anonymisierter Form",
  },
};

const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  purpose,
  onConsent,
  onClose,
  required = false,
}) => {
  const purposeInfo = ProcessingPurposeDescriptions[purpose];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">
              Einwilligung zur Datenverarbeitung
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                {purposeInfo.title}
              </h3>
              <p className="text-gray-700 mb-4">{purposeInfo.description}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Rechtsgrundlage
              </h4>
              <p className="text-blue-800 text-sm">{purposeInfo.legalBasis}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Verarbeitete Datentypen:
              </h4>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                {purposeInfo.dataTypes.map((type, index) => (
                  <li key={index}>{type}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Speicherdauer:</h4>
              <p className="text-gray-700 text-sm">{purposeInfo.retention}</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Ihre Rechte
              </h4>
              <p className="text-amber-800 text-sm">
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
                Einschränkung der Verarbeitung, Datenübertragbarkeit und
                Widerspruch. Bei Einwilligungsbasierter Verarbeitung können Sie
                Ihre Einwilligung jederzeit widerrufen.
              </p>
            </div>

            {required && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-800 text-sm font-medium">
                  Diese Einwilligung ist für die Nutzung des Dienstes
                  erforderlich.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => onConsent(true)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Einwilligung erteilen
            </button>
            <button
              onClick={() => onConsent(false)}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              disabled={required}
            >
              {required ? "Erforderlich" : "Ablehnen"}
            </button>
            {!required && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Später entscheiden
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DataProcessingConsent: React.FC<DataProcessingConsentProps> = ({
  purpose,
  onConsentChange,
  required = false,
  description,
  children,
}) => {
  const { user } = useAuthStore();
  const [currentConsent, setCurrentConsent] = useState<ConsentRecord | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCurrentConsent();
    }
  }, [user, purpose]);

  const loadCurrentConsent = async () => {
    try {
      setLoading(true);
      const consent = await GDPRService.getConsentRecord(user!.id, purpose);
      setCurrentConsent(consent);

      // Notify parent component of current consent status
      if (consent && !consent.withdrawnAt) {
        onConsentChange(consent.granted);
      } else {
        onConsentChange(false);
      }
    } catch (error) {
      console.error("Error loading consent:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentDecision = async (granted: boolean) => {
    try {
      if (!user) return;

      if (granted) {
        await GDPRService.recordConsent(user.id, purpose, granted);
      } else if (!required) {
        await GDPRService.recordConsent(user.id, purpose, false);
      }

      await loadCurrentConsent();
      onConsentChange(granted);
      setShowModal(false);
    } catch (error) {
      console.error("Error recording consent:", error);
    }
  };

  const handleWithdrawConsent = async () => {
    try {
      if (!user || !currentConsent) return;

      await GDPRService.withdrawConsent(user.id, purpose);
      await loadCurrentConsent();
      onConsentChange(false);
    } catch (error) {
      console.error("Error withdrawing consent:", error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  const hasValidConsent =
    currentConsent && currentConsent.granted && !currentConsent.withdrawnAt;
  const purposeInfo = ProcessingPurposeDescriptions[purpose];

  return (
    <>
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-start gap-3">
          <Shield
            className={`w-5 h-5 mt-0.5 ${
              hasValidConsent ? "text-green-600" : "text-gray-400"
            }`}
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">
              {purposeInfo.title}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {description || purposeInfo.description}
            </p>

            {hasValidConsent ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Einwilligung erteilt
                  </span>
                  <span className="text-xs text-gray-500">
                    (
                    {new Date(currentConsent.timestamp).toLocaleDateString(
                      "de-DE"
                    )}
                    )
                  </span>
                </div>
                {!required && (
                  <button
                    onClick={handleWithdrawConsent}
                    className="text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Widerrufen
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {required
                    ? "Einwilligung erforderlich"
                    : "Keine Einwilligung"}
                </span>
                <button
                  onClick={() => setShowModal(true)}
                  className={`text-sm px-3 py-1 rounded ${
                    required
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {required ? "Erforderlich" : "Erteilen"}
                </button>
              </div>
            )}
          </div>
        </div>

        {children && hasValidConsent && (
          <div className="mt-4 pt-4 border-t">{children}</div>
        )}
      </div>

      <ConsentModal
        isOpen={showModal}
        purpose={purpose}
        onConsent={handleConsentDecision}
        onClose={() => setShowModal(false)}
        required={required}
      />
    </>
  );
};

export default DataProcessingConsent;
