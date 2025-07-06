import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Download,
  Settings,
  User,
  Database,
  Activity,
  Lock,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  FileDown,
  AlertTriangle,
  Cookie,
  Bell,
  Mail,
  Phone,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { GDPRService } from "../../services/gdprService";
import {
  PrivacyDashboardData,
  DataExportRequest,
  DataDeletionRequest,
  AuditLogEntry,
  PrivacySettings,
} from "../../types/gdpr";
import LoadingSpinner from "../common/LoadingSpinner";

const PrivacyDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] =
    useState<PrivacyDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "settings" | "data" | "requests" | "audit"
  >("overview");
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<
    DataDeletionRequest[]
  >([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [privacySettings, setPrivacySettings] =
    useState<PrivacySettings | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [data, settings, exports, deletions, logs] = await Promise.all([
        GDPRService.getPrivacyDashboardData(user.id),
        GDPRService.getPrivacySettings(user.id),
        GDPRService.getDataExportRequests(user.id),
        GDPRService.getDataDeletionRequests(user.id),
        GDPRService.getAuditLogs(user.id),
      ]);

      setDashboardData(data);
      setPrivacySettings(settings);
      setExportRequests(exports);
      setDeletionRequests(deletions);
      setAuditLogs(logs);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportRequest = async () => {
    if (!user) return;

    try {
      setSubmitting(true);
      await GDPRService.requestDataExport(user.id, "complete");
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error requesting data export:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletionRequest = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Sind Sie sicher, dass Sie die Löschung Ihres Kontos beantragen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      await GDPRService.requestDataDeletion(user.id, "Benutzeranfrage");
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error requesting data deletion:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrivacySettingsUpdate = async (
    newSettings: Partial<PrivacySettings>
  ) => {
    if (!user || !privacySettings) return;

    try {
      setSubmitting(true);
      const updatedSettings = { ...privacySettings, ...newSettings };
      await GDPRService.updatePrivacySettings(user.id, updatedSettings);
      setPrivacySettings(updatedSettings);
    } catch (error) {
      console.error("Error updating privacy settings:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-charcoal via-gray-900 to-royal-charcoal flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 text-royal-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Anmeldung erforderlich
          </h2>
          <p className="text-gray-300">
            Sie müssen angemeldet sein, um auf das Datenschutz-Dashboard
            zuzugreifen.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-charcoal via-gray-900 to-royal-charcoal flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Übersicht", icon: Shield },
    { id: "settings", name: "Einstellungen", icon: Settings },
    { id: "data", name: "Meine Daten", icon: Database },
    { id: "requests", name: "Anfragen", icon: Download },
    { id: "audit", name: "Aktivitäten", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-charcoal via-gray-900 to-royal-charcoal py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-royal-gold mb-2">
            Datenschutz-Dashboard
          </h1>
          <p className="text-gray-300">
            Verwalten Sie Ihre Datenschutzeinstellungen und üben Sie Ihre
            DSGVO-Rechte aus
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-royal-gold text-royal-charcoal"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && dashboardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Account Info */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-6 w-6 text-royal-gold" />
                <h3 className="text-lg font-semibold text-white">
                  Konto-Übersicht
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-white">
                    {dashboardData.user.profile?.name || "Nicht verfügbar"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">E-Mail</p>
                  <p className="text-white">
                    {dashboardData.user.profile?.email || "Nicht verfügbar"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Konto erstellt</p>
                  <p className="text-white">
                    {dashboardData.user.accountCreated.toLocaleDateString(
                      "de-DE"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-royal-gold" />
                <h3 className="text-lg font-semibold text-white">Ihre Daten</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  Datenkategorien: {dashboardData.user.dataCategories.length}
                </p>
                <p className="text-sm text-gray-300">
                  Letzter Export:{" "}
                  {dashboardData.user.lastDataExport
                    ? dashboardData.user.lastDataExport.toLocaleDateString(
                        "de-DE"
                      )
                    : "Nie"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-6 w-6 text-royal-gold" />
                <h3 className="text-lg font-semibold text-white">
                  Schnellaktionen
                </h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab("data")}
                  className="w-full px-4 py-2 bg-royal-gold/20 text-royal-gold border border-royal-gold rounded-lg hover:bg-royal-gold/30 transition-colors text-sm"
                >
                  Daten exportieren
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="w-full px-4 py-2 bg-white/10 text-gray-300 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-sm"
                >
                  Einstellungen
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab Content */}
        {activeTab === "settings" && privacySettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Cookie Preferences */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="h-6 w-6 text-royal-gold" />
                <h3 className="text-lg font-semibold text-white">
                  Cookie-Einstellungen
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Notwendige Cookies</p>
                    <p className="text-sm text-gray-400">
                      Erforderlich für die Grundfunktionen der Website
                    </p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="ml-2 text-sm text-gray-400">
                      Immer aktiv
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Analytics Cookies</p>
                    <p className="text-sm text-gray-400">
                      Helfen uns, die Website zu verbessern
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.cookieConsent.analytics}
                      onChange={(e) =>
                        handlePrivacySettingsUpdate({
                          cookieConsent: {
                            ...privacySettings.cookieConsent,
                            analytics: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Marketing Cookies</p>
                    <p className="text-sm text-gray-400">
                      Für personalisierte Werbung
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.cookieConsent.marketing}
                      onChange={(e) =>
                        handlePrivacySettingsUpdate({
                          cookieConsent: {
                            ...privacySettings.cookieConsent,
                            marketing: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="h-6 w-6 text-royal-gold" />
                <h3 className="text-lg font-semibold text-white">
                  Kommunikationseinstellungen
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">
                        E-Mail Newsletter
                      </p>
                      <p className="text-sm text-gray-400">
                        Angebote und Neuigkeiten per E-Mail
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.communicationPreferences.email}
                      onChange={(e) =>
                        handlePrivacySettingsUpdate({
                          communicationPreferences: {
                            ...privacySettings.communicationPreferences,
                            email: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">
                        SMS Benachrichtigungen
                      </p>
                      <p className="text-sm text-gray-400">
                        Wichtige Updates per SMS
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.communicationPreferences.sms}
                      onChange={(e) =>
                        handlePrivacySettingsUpdate({
                          communicationPreferences: {
                            ...privacySettings.communicationPreferences,
                            sms: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Data Processing Consent */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-royal-gold" />
                <h3 className="text-lg font-semibold text-white">
                  Datenverarbeitung
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      Profiling für Empfehlungen
                    </p>
                    <p className="text-sm text-gray-400">
                      Personalisierte Angebote basierend auf Ihren Präferenzen
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.dataProcessingConsent.profiling}
                      onChange={(e) =>
                        handlePrivacySettingsUpdate({
                          dataProcessingConsent: {
                            ...privacySettings.dataProcessingConsent,
                            profiling: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      Anonymisierte Analytik
                    </p>
                    <p className="text-sm text-gray-400">
                      Hilft bei der Verbesserung unserer Services
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.dataProcessingConsent.analytics}
                      onChange={(e) =>
                        handlePrivacySettingsUpdate({
                          dataProcessingConsent: {
                            ...privacySettings.dataProcessingConsent,
                            analytics: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Data Tab Content */}
        {activeTab === "data" && dashboardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Data Categories */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-royal-gold" />
                <h3 className="text-lg font-semibold text-white">
                  Ihre gespeicherten Daten
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.user.dataCategories.map((category) => (
                  <div
                    key={category}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <p className="text-white font-medium capitalize">
                      {category}
                    </p>
                    <p className="text-sm text-gray-400">
                      {category === "profile" && "Name, E-Mail, Telefonnummer"}
                      {category === "reservations" &&
                        "Tischreservierungen und Präferenzen"}
                      {category === "orders" &&
                        "Bestellhistorie und Zahlungsdaten"}
                      {category === "loyalty" && "Treuepunkte und Belohnungen"}
                      {category === "events" &&
                        "Event-Teilnahmen und Vorlieben"}
                      {category === "analytics" &&
                        "Nutzungsstatistiken (anonymisiert)"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Data Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FileDown className="h-6 w-6 text-royal-gold" />
                <h3 className="text-lg font-semibold text-white">
                  Daten exportieren
                </h3>
              </div>
              <p className="text-gray-300 mb-4">
                Sie haben das Recht, eine Kopie aller Ihrer persönlichen Daten
                in einem strukturierten, gängigen und maschinenlesbaren Format
                zu erhalten.
              </p>
              <button
                onClick={handleExportRequest}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-royal-gold text-royal-charcoal font-medium rounded-lg hover:bg-royal-gold/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <LoadingSpinner />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                Datenexport anfordern
              </button>

              {dashboardData.user.lastDataExport && (
                <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-green-300">
                      Letzter Export:{" "}
                      {dashboardData.user.lastDataExport.toLocaleDateString(
                        "de-DE"
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Account Section */}
            <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">
                  Konto löschen
                </h3>
              </div>
              <p className="text-gray-300 mb-4">
                Sie haben das Recht auf Löschung ("Recht auf Vergessenwerden").
                Beachten Sie, dass bestimmte Daten aus rechtlichen Gründen
                aufbewahrt werden müssen.
              </p>
              <button
                onClick={handleDeletionRequest}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <LoadingSpinner />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
                Löschung beantragen
              </button>
            </div>
          </motion.div>
        )}

        {/* Requests Tab Content */}
        {activeTab === "requests" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Export Requests */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Download className="h-6 w-6 text-royal-gold" />
                <h3 className="text-lg font-semibold text-white">
                  Datenexport-Anfragen
                </h3>
              </div>
              {exportRequests.length === 0 ? (
                <p className="text-gray-400">
                  Keine Export-Anfragen vorhanden.
                </p>
              ) : (
                <div className="space-y-3">
                  {exportRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            {request.dataCategories.join(", ")}
                          </p>
                          <p className="text-sm text-gray-400">
                            Angefragt:{" "}
                            {request.requestedAt.toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === "pending" && (
                            <>
                              <Clock className="h-5 w-5 text-yellow-500" />
                              <span className="text-yellow-500">
                                Ausstehend
                              </span>
                            </>
                          )}
                          {request.status === "processing" && (
                            <>
                              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                              <span className="text-blue-500">Bearbeitung</span>
                            </>
                          )}
                          {request.status === "completed" && (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-green-500">
                                Abgeschlossen
                              </span>
                            </>
                          )}
                          {request.status === "failed" && (
                            <>
                              <XCircle className="h-5 w-5 text-red-500" />
                              <span className="text-red-500">Fehler</span>
                            </>
                          )}
                        </div>
                      </div>
                      {request.downloadUrl && (
                        <a
                          href={request.downloadUrl}
                          download
                          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-royal-gold text-royal-charcoal rounded-lg hover:bg-royal-gold/90 transition-colors text-sm"
                        >
                          <Download className="h-4 w-4" />
                          Herunterladen
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deletion Requests */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="h-6 w-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">
                  Lösch-Anfragen
                </h3>
              </div>
              {deletionRequests.length === 0 ? (
                <p className="text-gray-400">Keine Lösch-Anfragen vorhanden.</p>
              ) : (
                <div className="space-y-3">
                  {deletionRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            Kontolöschung
                          </p>
                          <p className="text-sm text-gray-400">
                            Angefragt:{" "}
                            {request.requestedAt.toLocaleDateString("de-DE")}
                          </p>
                          <p className="text-sm text-gray-400">
                            Grund: {request.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === "pending" && (
                            <>
                              <Clock className="h-5 w-5 text-yellow-500" />
                              <span className="text-yellow-500">
                                Ausstehend
                              </span>
                            </>
                          )}
                          {request.status === "processing" && (
                            <>
                              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                              <span className="text-blue-500">Bearbeitung</span>
                            </>
                          )}
                          {request.status === "completed" && (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-green-500">
                                Abgeschlossen
                              </span>
                            </>
                          )}
                          {request.status === "rejected" && (
                            <>
                              <XCircle className="h-5 w-5 text-red-500" />
                              <span className="text-red-500">Abgelehnt</span>
                            </>
                          )}
                        </div>
                      </div>
                      {request.adminNotes && (
                        <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-300 text-sm">
                            <strong>Admin-Notiz:</strong> {request.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Audit Tab Content */}
        {activeTab === "audit" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-6 w-6 text-royal-gold" />
                <h3 className="text-lg font-semibold text-white">
                  Datenzugriff-Protokoll
                </h3>
              </div>
              <p className="text-gray-300 mb-4">
                Hier sehen Sie alle Zugriffe auf Ihre persönlichen Daten in den
                letzten 90 Tagen.
              </p>

              {auditLogs.length === 0 ? (
                <p className="text-gray-400">
                  Keine Protokolleinträge verfügbar.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {log.action === "read" && (
                              <Eye className="h-4 w-4 text-blue-400" />
                            )}
                            {log.action === "update" && (
                              <Settings className="h-4 w-4 text-yellow-400" />
                            )}
                            {log.action === "delete" && (
                              <Trash2 className="h-4 w-4 text-red-400" />
                            )}
                            {log.action === "export" && (
                              <Download className="h-4 w-4 text-green-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">
                              {log.action === "read" && "Datenzugriff"}
                              {log.action === "update" && "Datenaktualisierung"}
                              {log.action === "delete" && "Datenlöschung"}
                              {log.action === "export" && "Datenexport"}
                            </p>
                            <p className="text-sm text-gray-400">
                              {log.dataCategory} -{" "}
                              {typeof log.details === "object"
                                ? JSON.stringify(log.details)
                                : log.details}
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.timestamp.toLocaleString("de-DE")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            IP: {log.ipAddress}
                          </p>
                          <p className="text-xs text-gray-400">
                            {log.userAgent}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Placeholder for other tabs */}
        {!["overview", "settings", "data", "requests", "audit"].includes(
          activeTab
        ) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              {tabs.find((t) => t.id === activeTab)?.name}
            </h3>
            <p className="text-gray-300">
              Diese Sektion wird in Kürze verfügbar sein.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PrivacyDashboard;
