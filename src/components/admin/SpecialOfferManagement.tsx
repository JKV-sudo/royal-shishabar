import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  TrendingUp,
  Clock,
  Percent,
} from "lucide-react";
import { SpecialOffer } from "../../types/menu";
import { SpecialOfferService } from "../../services/specialOfferService";
import SpecialOfferForm from "./SpecialOfferForm";
import { toast } from "react-hot-toast";

const SPECIAL_OFFER_CATEGORIES = [
  { id: "all", name: "Alle Kategorien" },
  { id: "food", name: "Speisen" },
  { id: "drinks", name: "Getränke" },
  { id: "tobacco", name: "Tabak" },
  { id: "combo", name: "Kombi-Angebot" },
  { id: "event", name: "Event-Special" },
  { id: "other", name: "Sonstiges" },
];

const SpecialOfferManagement: React.FC = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const unsubscribe = SpecialOfferService.onSpecialOffersChange((offers) => {
      setOffers(offers);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let filtered = offers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (offer) =>
          offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (offer) => offer.category === selectedCategory
      );
    }

    // Filter by status
    if (statusFilter === "active") {
      filtered = filtered.filter((offer) => offer.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((offer) => !offer.isActive);
    }

    setFilteredOffers(filtered);
  }, [offers, searchTerm, selectedCategory, statusFilter]);

  const handleCreateOffer = () => {
    setEditingOffer(undefined);
    setShowForm(true);
  };

  const handleEditOffer = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleDeleteOffer = async (offer: SpecialOffer) => {
    if (!offer.id) return;

    if (
      window.confirm(
        `Sind Sie sicher, dass Sie "${offer.title}" löschen möchten?`
      )
    ) {
      try {
        await SpecialOfferService.deleteSpecialOffer(offer.id);
        toast.success("Sonderangebot erfolgreich gelöscht");
      } catch (error) {
        console.error("Error deleting special offer:", error);
        toast.error("Fehler beim Löschen des Sonderangebots");
      }
    }
  };

  const handleToggleStatus = async (offer: SpecialOffer) => {
    if (!offer.id) return;

    try {
      await SpecialOfferService.updateSpecialOffer(offer.id, {
        isActive: !offer.isActive,
      });
      toast.success(
        `Sonderangebot ${offer.isActive ? "deaktiviert" : "aktiviert"}`
      );
    } catch (error) {
      console.error("Error toggling offer status:", error);
      toast.error("Fehler beim Ändern des Status");
    }
  };

  const getStatusBadge = (offer: SpecialOffer) => {
    const now = new Date();
    const isExpired = offer.endDate < now;
    const isNotStarted = offer.startDate > now;

    if (!offer.isActive) {
      return (
        <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
          Inaktiv
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
          Abgelaufen
        </span>
      );
    }
    if (isNotStarted) {
      return (
        <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
          Geplant
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
        Aktiv
      </span>
    );
  };

  const getCategoryName = (category: string) => {
    const cat = SPECIAL_OFFER_CATEGORIES.find((c) => c.id === category);
    return cat?.name || category;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStats = () => {
    const total = offers.length;
    const active = offers.filter((o) => o.isActive).length;
    const expired = offers.filter((o) => o.endDate < new Date()).length;
    const totalDiscount = offers.reduce(
      (sum, o) => sum + o.discountPercentage,
      0
    );
    const avgDiscount = total > 0 ? Math.round(totalDiscount / total) : 0;

    return { total, active, expired, avgDiscount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-royal-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-royal-cream-light">Lade Sonderangebote...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-royal font-bold text-royal-gold">
            Sonderangebote verwalten
          </h2>
          <p className="text-royal-cream-light">
            Erstellen und verwalten Sie exklusive Angebote für Ihre Kunden
          </p>
        </div>
        <button
          onClick={handleCreateOffer}
          className="flex items-center space-x-2 px-4 py-2 bg-royal-gradient-gold text-royal-charcoal rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          <Plus size={16} />
          <span>Neues Angebot</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Gesamt</p>
              <p className="text-2xl font-bold text-royal-gold">
                {stats.total}
              </p>
            </div>
            <Tag className="w-8 h-8 text-royal-gold" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Aktiv</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.active}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Abgelaufen</p>
              <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
            </div>
            <Clock className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Ø Rabatt</p>
              <p className="text-2xl font-bold text-royal-gold">
                {stats.avgDiscount}%
              </p>
            </div>
            <Percent className="w-8 h-8 text-royal-gold" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-cream-light w-4 h-4" />
            <input
              type="text"
              placeholder="Sonderangebote durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
          >
            {SPECIAL_OFFER_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-royal-charcoal-light border border-royal-gold/30 rounded-lg text-royal-cream focus:border-royal-gold focus:outline-none"
          >
            <option value="all">Alle Status</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
          </select>
        </div>
      </div>

      {/* Offers List */}
      <div className="bg-royal-charcoal rounded-lg border border-royal-gold/20 overflow-hidden">
        {filteredOffers.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="w-12 h-12 text-royal-gold/50 mx-auto mb-4" />
            <p className="text-royal-cream-light text-lg mb-2">
              Keine Sonderangebote gefunden
            </p>
            <p className="text-royal-cream-light/70">
              {offers.length === 0
                ? "Erstellen Sie Ihr erstes Sonderangebot"
                : "Versuchen Sie andere Suchkriterien"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-royal-charcoal-dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-cream-light uppercase tracking-wider">
                    Angebot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-cream-light uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-cream-light uppercase tracking-wider">
                    Rabatt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-cream-light uppercase tracking-wider">
                    Zeitraum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-cream-light uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-cream-light uppercase tracking-wider">
                    Nutzungen
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-royal-cream-light uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-royal-gold/10">
                {filteredOffers.map((offer, index) => (
                  <motion.tr
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-royal-charcoal-light transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {offer.imageUrl && (
                          <img
                            src={offer.imageUrl}
                            alt={offer.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-royal-cream">
                            {offer.title}
                          </div>
                          <div className="text-sm text-royal-cream-light max-w-xs truncate">
                            {offer.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-royal-cream-light">
                        {getCategoryName(offer.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-royal-cream">
                          <span className="line-through text-royal-cream-light">
                            €{offer.originalPrice.toFixed(2)}
                          </span>
                          {" → "}
                          <span className="text-royal-gold font-semibold">
                            €{offer.discountedPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-royal-gold">
                          -{offer.discountPercentage}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-royal-cream-light">
                        <div>{formatDate(offer.startDate)}</div>
                        <div>bis {formatDate(offer.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(offer)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-royal-cream-light">
                        {offer.currentUses}
                        {offer.maxUses && ` / ${offer.maxUses}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(offer)}
                          className="p-1 text-royal-cream-light hover:text-royal-gold transition-colors"
                          title={offer.isActive ? "Deaktivieren" : "Aktivieren"}
                        >
                          {offer.isActive ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditOffer(offer)}
                          className="p-1 text-royal-cream-light hover:text-royal-gold transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <SpecialOfferForm
            offer={editingOffer}
            onClose={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpecialOfferManagement;
