import React, { useState, useEffect } from "react";
import { Shield, Check, AlertTriangle, Info, X } from "lucide-react";
import { GDPRService } from "../../services/gdprService";
import { useAuthStore } from "../../stores/authStore";
import { ConsentRecord, ProcessingPurpose } from "../../types/gdpr";
import { toast } from "react-hot-toast";
import { getFirebaseAuth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">
                Einwilligung zur Datenverarbeitung
              </h2>
            </div>
            {!required && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            )}
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
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Check className="w-4 h-4" />
              Einwilligung erteilen
            </button>
            <button
              onClick={() => onConsent(false)}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-medium transition-colors"
              disabled={required}
            >
              {required ? "Erforderlich" : "Ablehnen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to wait for Firebase Auth to be ready
const waitForAuthReady = (): Promise<any> => {
  return new Promise((resolve) => {
    const auth = getFirebaseAuth();
    if (auth.currentUser !== undefined) {
      resolve(auth.currentUser);
    } else {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    }
  });
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCurrentConsent();
    } else {
      setLoading(false);
      setError("Bitte melden Sie sich an, um fortzufahren.");
    }
  }, [user, purpose]);

  const loadCurrentConsent = async () => {
    try {
      setLoading(true);
      setError(null);

      // First check AuthStore user (more reliable for UI state)
      if (!user) {
        setError("Bitte melden Sie sich an, um fortzufahren.");
        onConsentChange(false);
        return;
      }

      // Wait for Firebase Auth to be ready
      const currentFirebaseUser = await waitForAuthReady();

      console.log("🔍 Loading consent with:", {
        authStoreUserId: user.id,
        firebaseUid: currentFirebaseUser?.uid,
        purpose,
        idsMatch: currentFirebaseUser?.uid === user.id,
      });

      // Use Firebase UID if available, fall back to user.id only if necessary
      const userId = currentFirebaseUser?.uid || user.id;
      const consent = await GDPRService.getConsentRecord(userId, purpose);
      setCurrentConsent(consent);

      // Notify parent component of current consent status
      if (consent && !consent.withdrawnAt) {
        onConsentChange(consent.granted);
      } else {
        onConsentChange(false);
      }
    } catch (error) {
      console.error("Error loading consent:", error);
      setError("Fehler beim Laden der Einwilligungsdaten");
      onConsentChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentDecision = async (granted: boolean) => {
    try {
      if (!user) {
        console.error("❌ No user found for consent");
        toast.error("Bitte melden Sie sich an");
        return;
      }

      console.log("🔄 Waiting for Firebase Auth to be ready...");
      // Wait for Firebase Auth to be properly initialized
      const currentFirebaseUser = await waitForAuthReady();

      console.log("🔐 Starting consent process:", {
        authStoreUserId: user.id,
        firebaseUid: currentFirebaseUser?.uid,
        purpose,
        granted,
        firebaseAuthState: !!currentFirebaseUser,
        userEmail: currentFirebaseUser?.email || user.email,
        idsMatch: currentFirebaseUser?.uid === user.id,
        tokenPresent: !!currentFirebaseUser?.accessToken,
      });

      // Additional check: verify the user is properly authenticated
      if (currentFirebaseUser) {
        try {
          const token = await currentFirebaseUser.getIdToken();
          console.log("✅ Firebase Auth token retrieved successfully");
        } catch (tokenError) {
          console.error("❌ Failed to get Firebase Auth token:", tokenError);
          toast.error(
            "Authentifizierungstoken ungültig. Bitte melden Sie sich erneut an."
          );
          return;
        }
      }

      setError(null);

      // Always try with Firebase UID if user is authenticated
      if (currentFirebaseUser?.uid) {
        console.log(
          "✅ Using Firebase UID for consent:",
          currentFirebaseUser.uid
        );
        await GDPRService.recordConsent(
          currentFirebaseUser.uid,
          purpose,
          granted
        );
      } else {
        console.error("❌ No authenticated Firebase user found");
        toast.error(
          "Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an."
        );
        return;
      }

      console.log("✅ Consent recorded, reloading current consent");

      await loadCurrentConsent();
      onConsentChange(granted);
      setShowModal(false);

      if (granted) {
        toast.success("Einwilligung erfolgreich erteilt");
      }
    } catch (error) {
      console.error("❌ Error recording consent:", error);

      let errorMessage = "Fehler beim Speichern der Einwilligung";

      if (error instanceof Error) {
        if (error.message.includes("insufficient permissions")) {
          errorMessage = "Keine Berechtigung. Bitte melden Sie sich erneut an.";
        } else if (error.message.includes("network")) {
          errorMessage =
            "Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleWithdrawConsent = async () => {
    try {
      if (!user || !currentConsent) return;

      // Wait for Firebase Auth to be ready
      const currentFirebaseUser = await waitForAuthReady();

      // Use Firebase UID if available, otherwise fall back to user.id from store
      const userId = currentFirebaseUser?.uid || user.id;

      setError(null);
      await GDPRService.withdrawConsent(userId, purpose);
      await loadCurrentConsent();
      onConsentChange(false);
      toast.success("Einwilligung widerrufen");
    } catch (error) {
      console.error("Error withdrawing consent:", error);
      setError("Fehler beim Widerrufen der Einwilligung");
      toast.error("Fehler beim Widerrufen der Einwilligung");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-royal-charcoal-dark rounded-lg p-4 border border-royal-gold/30">
        <div className="h-4 bg-royal-gold/30 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-royal-gold/30 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500 rounded-lg p-4 bg-red-50">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Fehler</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={loadCurrentConsent}
          className="mt-2 text-sm text-red-700 underline hover:text-red-800"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  const hasValidConsent =
    currentConsent && currentConsent.granted && !currentConsent.withdrawnAt;
  const purposeInfo = ProcessingPurposeDescriptions[purpose];

  return (
    <>
      <div className="border border-royal-gold/30 rounded-lg p-4 bg-royal-charcoal-dark">
        <div className="flex items-start gap-3">
          <Shield
            className={`w-5 h-5 mt-0.5 ${
              hasValidConsent ? "text-green-400" : "text-royal-gold"
            }`}
          />
          <div className="flex-1">
            <h3 className="font-medium text-royal-cream mb-1">
              {purposeInfo.title}
              {required && <span className="text-red-400 ml-1">*</span>}
            </h3>
            <p className="text-sm text-royal-cream/70 mb-3">
              {description || purposeInfo.description}
            </p>

            {hasValidConsent ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Einwilligung erteilt
                  </span>
                  <span className="text-xs text-royal-cream/50">
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
                    className="text-sm text-red-400 hover:text-red-300 underline transition-colors"
                  >
                    Widerrufen
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-royal-cream/60">
                  {required
                    ? "Einwilligung erforderlich"
                    : "Keine Einwilligung"}
                </span>
                <button
                  onClick={() => setShowModal(true)}
                  className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                    required
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-royal-gold text-royal-charcoal hover:bg-royal-gold/90"
                  }`}
                >
                  {required
                    ? "Erforderlich - Klicken"
                    : "Einwilligung erteilen"}
                </button>
              </div>
            )}
          </div>
        </div>

        {children && hasValidConsent && (
          <div className="mt-4 pt-4 border-t border-royal-gold/30">
            {children}
          </div>
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
