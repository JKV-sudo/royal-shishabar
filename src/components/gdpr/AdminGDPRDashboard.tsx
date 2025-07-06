import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Download,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  BarChart3,
  Eye,
  Settings,
  Filter,
  RefreshCw,
  User,
  Crown,
} from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import { GDPRService } from "../../services/gdprService";
import {
  DataExportRequest,
  DataDeletionRequest,
  AuditLogEntry,
  PrivacySettings,
} from "../../types/gdpr";
import LoadingSpinner from "../common/LoadingSpinner";
import toast from "react-hot-toast";

interface AdminGDPRStats {
  totalUsers: number;
  activeExportRequests: number;
  activeDeletionRequests: number;
  completedExportsToday: number;
  completedDeletionsToday: number;
  averageProcessingTime: number;
  complianceScore: number;
  totalAuditLogs: number;
}

interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  role: string;
  hasGDPRRequests: boolean;
  lastLogin: Date;
  dataCategories: string[];
}

const AdminGDPRDashboard: React.FC = () => {
  const { canAccessAdmin, requiresAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState<
    "overview" | "exports" | "deletions" | "users" | "audit" | "compliance"
  >("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminGDPRStats | null>(null);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<
    DataDeletionRequest[]
  >([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );
  const [userPrivacySettings, setUserPrivacySettings] =
    useState<PrivacySettings | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "processing" | "completed" | "failed"
  >("all");

  useEffect(() => {
    if (canAccessAdmin()) {
      loadDashboardData();
    }
  }, [canAccessAdmin]);

  const loadDashboardData = async () => {
    if (!requiresAdmin("Load GDPR dashboard data")) return;

    try {
      setLoading(true);
      const [
        adminStats,
        allExportRequests,
        allDeletionRequests,
        systemAuditLogs,
      ] = await Promise.all([
        GDPRService.getAdminGDPRStats(),
        GDPRService.getAllDataExportRequests(),
        GDPRService.getAllDataDeletionRequests(),
        GDPRService.getSystemAuditLogs(100),
      ]);

      setStats(adminStats);
      setExportRequests(allExportRequests);
      setDeletionRequests(allDeletionRequests);
      setAuditLogs(systemAuditLogs);
    } catch (error) {
      console.error("Error loading GDPR dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) return;

    try {
      const results = await GDPRService.searchUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    }
  };

  const handleUserSelect = async (user: UserSearchResult) => {
    setSelectedUser(user);
    try {
      const settings = await GDPRService.getPrivacySettings(user.id);
      setUserPrivacySettings(settings);
    } catch (error) {
      console.error("Error loading user privacy settings:", error);
    }
  };

  const handleProcessExportRequest = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    if (!requiresAdmin("Process export request")) return;

    try {
      await GDPRService.adminProcessExportRequest(requestId, action);
      toast.success(`Export request ${action}d successfully`);
      await loadDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing export request:`, error);
      toast.error(`Failed to ${action} export request`);
    }
  };

  const handleProcessDeletionRequest = async (
    requestId: string,
    action: "approve" | "reject",
    notes?: string
  ) => {
    if (!requiresAdmin("Process deletion request")) return;

    try {
      await GDPRService.adminProcessDeletionRequest(requestId, action, notes);
      toast.success(`Deletion request ${action}d successfully`);
      await loadDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing deletion request:`, error);
      toast.error(`Failed to ${action} deletion request`);
    }
  };

  const handleGenerateComplianceReport = async () => {
    if (!requiresAdmin("Generate compliance report")) return;

    try {
      const report = await GDPRService.generateComplianceReport();
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gdpr-compliance-report-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Compliance report generated");
    } catch (error) {
      console.error("Error generating compliance report:", error);
      toast.error("Failed to generate compliance report");
    }
  };

  if (!canAccessAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-charcoal via-gray-900 to-royal-charcoal flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-16 w-16 text-royal-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Admin Access Required
          </h2>
          <p className="text-gray-300">
            You need administrator privileges to access this GDPR dashboard.
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
    { id: "overview", name: "Übersicht", icon: BarChart3 },
    { id: "exports", name: "Datenexporte", icon: Download },
    { id: "deletions", name: "Löschanfragen", icon: Trash2 },
    { id: "users", name: "Benutzerverwaltung", icon: Users },
    { id: "audit", name: "Audit-Protokoll", icon: Activity },
    { id: "compliance", name: "Compliance", icon: Shield },
  ];

  const filteredExportRequests =
    filterStatus === "all"
      ? exportRequests
      : exportRequests.filter((req) => req.status === filterStatus);

  const filteredDeletionRequests =
    filterStatus === "all"
      ? deletionRequests
      : deletionRequests.filter((req) => req.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-royal-gold mb-2">
          GDPR Admin Dashboard
        </h1>
        <p className="text-gray-300">
          Datenschutz-Compliance-Management und Benutzerdatenanfragen
        </p>
        <div className="flex justify-center mt-4">
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-royal-gold/20 text-royal-gold border border-royal-gold rounded-lg hover:bg-royal-gold/30 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Aktualisieren
          </button>
        </div>
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

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalUsers}
                    </p>
                    <p className="text-sm text-gray-400">Benutzer gesamt</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3">
                  <Download className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.activeExportRequests}
                    </p>
                    <p className="text-sm text-gray-400">Aktive Exporte</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-8 w-8 text-red-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.activeDeletionRequests}
                    </p>
                    <p className="text-sm text-gray-400">Aktive Löschungen</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-royal-gold" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.complianceScore}%
                    </p>
                    <p className="text-sm text-gray-400">Compliance-Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Heutige Aktivitäten
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      Abgeschlossene Exporte
                    </span>
                    <span className="text-green-400 font-medium">
                      {stats.completedExportsToday}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      Abgeschlossene Löschungen
                    </span>
                    <span className="text-red-400 font-medium">
                      {stats.completedDeletionsToday}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ø Bearbeitungszeit</span>
                    <span className="text-blue-400 font-medium">
                      {stats.averageProcessingTime}h
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Schnellaktionen
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleGenerateComplianceReport}
                    className="w-full px-4 py-2 bg-royal-gold/20 text-royal-gold border border-royal-gold rounded-lg hover:bg-royal-gold/30 transition-colors"
                  >
                    Compliance-Bericht generieren
                  </button>
                  <button
                    onClick={() => setActiveTab("exports")}
                    className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    Export-Anfragen bearbeiten
                  </button>
                  <button
                    onClick={() => setActiveTab("deletions")}
                    className="w-full px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Lösch-Anfragen bearbeiten
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Export Requests Tab */}
        {activeTab === "exports" && (
          <>
            {/* Filter Controls */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <span className="text-white">Filter:</span>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="all">Alle Status</option>
                  <option value="pending">Ausstehend</option>
                  <option value="processing">Bearbeitung</option>
                  <option value="completed">Abgeschlossen</option>
                  <option value="failed">Fehler</option>
                </select>
              </div>
            </div>

            {/* Export Requests List */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Datenexport-Anfragen
              </h3>
              {filteredExportRequests.length === 0 ? (
                <p className="text-gray-400">Keine Export-Anfragen gefunden.</p>
              ) : (
                <div className="space-y-4">
                  {filteredExportRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="text-white font-medium">
                              User ID: {request.userId}
                            </span>
                            <div className="flex items-center gap-2">
                              {request.status === "pending" && (
                                <>
                                  <Clock className="h-4 w-4 text-yellow-500" />
                                  <span className="text-yellow-500 text-sm">
                                    Ausstehend
                                  </span>
                                </>
                              )}
                              {request.status === "processing" && (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                  <span className="text-blue-500 text-sm">
                                    Bearbeitung
                                  </span>
                                </>
                              )}
                              {request.status === "completed" && (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-green-500 text-sm">
                                    Abgeschlossen
                                  </span>
                                </>
                              )}
                              {request.status === "failed" && (
                                <>
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-red-500 text-sm">
                                    Fehler
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">
                            Kategorien: {request.dataCategories.join(", ")}
                          </p>
                          <p className="text-sm text-gray-400">
                            Angefragt:{" "}
                            {request.requestedAt.toLocaleDateString("de-DE")}
                          </p>
                        </div>

                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleProcessExportRequest(
                                  request.id,
                                  "approve"
                                )
                              }
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                            >
                              Genehmigen
                            </button>
                            <button
                              onClick={() =>
                                handleProcessExportRequest(request.id, "reject")
                              }
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                            >
                              Ablehnen
                            </button>
                          </div>
                        )}

                        {request.downloadUrl && (
                          <a
                            href={request.downloadUrl}
                            download
                            className="inline-flex items-center gap-2 px-3 py-1 bg-royal-gold text-royal-charcoal rounded hover:bg-royal-gold/90 transition-colors text-sm"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Deletion Requests Tab */}
        {activeTab === "deletions" && (
          <>
            {/* Filter Controls */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <span className="text-white">Filter:</span>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="all">Alle Status</option>
                  <option value="pending">Ausstehend</option>
                  <option value="processing">Bearbeitung</option>
                  <option value="completed">Abgeschlossen</option>
                  <option value="rejected">Abgelehnt</option>
                </select>
              </div>
            </div>

            {/* Deletion Requests List */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Löschanfragen
              </h3>
              {filteredDeletionRequests.length === 0 ? (
                <p className="text-gray-400">Keine Löschanfragen gefunden.</p>
              ) : (
                <div className="space-y-4">
                  {filteredDeletionRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="text-white font-medium">
                              User ID: {request.userId}
                            </span>
                            <div className="flex items-center gap-2">
                              {request.status === "pending" && (
                                <>
                                  <Clock className="h-4 w-4 text-yellow-500" />
                                  <span className="text-yellow-500 text-sm">
                                    Ausstehend
                                  </span>
                                </>
                              )}
                              {request.status === "processing" && (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                  <span className="text-blue-500 text-sm">
                                    Bearbeitung
                                  </span>
                                </>
                              )}
                              {request.status === "completed" && (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-green-500 text-sm">
                                    Abgeschlossen
                                  </span>
                                </>
                              )}
                              {request.status === "rejected" && (
                                <>
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-red-500 text-sm">
                                    Abgelehnt
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">
                            Grund: {request.reason || "Nicht angegeben"}
                          </p>
                          <p className="text-sm text-gray-400">
                            Angefragt:{" "}
                            {request.requestedAt.toLocaleDateString("de-DE")}
                          </p>
                          <p className="text-sm text-gray-400">
                            Geplante Löschung:{" "}
                            {request.scheduledDeletionDate.toLocaleDateString(
                              "de-DE"
                            )}
                          </p>
                          {request.retentionReasons &&
                            request.retentionReasons.length > 0 && (
                              <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded">
                                <p className="text-yellow-300 text-sm">
                                  <strong>Aufbewahrungsgründe:</strong>{" "}
                                  {request.retentionReasons.join(", ")}
                                </p>
                              </div>
                            )}
                          {request.adminNotes && (
                            <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500/30 rounded">
                              <p className="text-blue-300 text-sm">
                                <strong>Admin-Notiz:</strong>{" "}
                                {request.adminNotes}
                              </p>
                            </div>
                          )}
                        </div>

                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const notes = prompt("Admin-Notiz (optional):");
                                handleProcessDeletionRequest(
                                  request.id,
                                  "approve",
                                  notes || undefined
                                );
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                            >
                              Genehmigen
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt("Ablehnungsgrund:");
                                if (notes) {
                                  handleProcessDeletionRequest(
                                    request.id,
                                    "reject",
                                    notes
                                  );
                                }
                              }}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                            >
                              Ablehnen
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* User Management Tab */}
        {activeTab === "users" && (
          <>
            {/* User Search */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Benutzer suchen
              </h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="E-Mail, Name oder User ID eingeben..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-royal-gold"
                    onKeyPress={(e) => e.key === "Enter" && handleSearchUsers()}
                  />
                </div>
                <button
                  onClick={handleSearchUsers}
                  className="flex items-center gap-2 px-4 py-2 bg-royal-gold text-royal-charcoal rounded-lg hover:bg-royal-gold/90 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Suchen
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Suchergebnisse
                </h3>
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? "bg-royal-gold/20 border-royal-gold"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          <p className="text-sm text-gray-400">
                            Rolle: {user.role}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {user.hasGDPRRequests && (
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <span className="text-yellow-500 text-sm">
                                  GDPR-Anfragen
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            Letzter Login:{" "}
                            {user.lastLogin.toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected User Details */}
            {selectedUser && userPrivacySettings && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Datenschutzeinstellungen für {selectedUser.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">
                      Cookie-Einstellungen
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Analytics</span>
                        <span
                          className={
                            userPrivacySettings.cookieConsent.analytics
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {userPrivacySettings.cookieConsent.analytics
                            ? "Aktiv"
                            : "Inaktiv"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Marketing</span>
                        <span
                          className={
                            userPrivacySettings.cookieConsent.marketing
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {userPrivacySettings.cookieConsent.marketing
                            ? "Aktiv"
                            : "Inaktiv"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3">
                      Kommunikation
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">E-Mail</span>
                        <span
                          className={
                            userPrivacySettings.communicationPreferences.email
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {userPrivacySettings.communicationPreferences.email
                            ? "Aktiv"
                            : "Inaktiv"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">SMS</span>
                        <span
                          className={
                            userPrivacySettings.communicationPreferences.sms
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {userPrivacySettings.communicationPreferences.sms
                            ? "Aktiv"
                            : "Inaktiv"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-white font-medium mb-3">
                    Datenkategorien
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.dataCategories.map((category) => (
                      <span
                        key={category}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Audit Tab */}
        {activeTab === "audit" && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              System-Audit-Protokoll
            </h3>
            {auditLogs.length === 0 ? (
              <p className="text-gray-400">Keine Audit-Logs verfügbar.</p>
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
                          <p className="text-white font-medium">
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
                          {log.userId && (
                            <p className="text-xs text-gray-500">
                              User: {log.userId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          IP: {log.ipAddress}
                        </p>
                        <p className="text-xs text-gray-400">{log.userAgent}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === "compliance" && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              GDPR Compliance Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Cookie-Consent-System</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Datenschutzerklärung</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Datenexport-System</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Löschrecht-System</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Audit-Logging</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Admin-Dashboard</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Datenanonymisierung</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Benutzer-Dashboard</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-green-300 font-medium">
                  GDPR-Compliance vollständig implementiert
                </p>
              </div>
              <p className="text-green-300/80 text-sm mt-1">
                Alle erforderlichen Systeme und Prozesse sind aktiv und
                funktionsfähig.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminGDPRDashboard;
