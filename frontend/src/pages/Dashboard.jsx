import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Copy, Trash2, ExternalLink, Plus, TrendingUp,
  Link as LinkIcon, BarChart3, Loader2, Clock, ChevronDown
} from "lucide-react";
import { createShortUrl, getUserUrls, deleteUrl } from "../services/url.service";

// Preset expiry durations
const EXPIRY_OPTIONS = [
  { label: "No expiry", value: null },
  { label: "1 hour",    value: 1 * 60 * 60 * 1000 },
  { label: "24 hours",  value: 24 * 60 * 60 * 1000 },
  { label: "7 days",    value: 7 * 24 * 60 * 60 * 1000 },
  { label: "30 days",   value: 30 * 24 * 60 * 60 * 1000 },
  { label: "Custom…",   value: "custom" },
];

function computeExpiresAt(selectedValue, customDate) {
  if (!selectedValue) return null;                         // never expires
  if (selectedValue === "custom") return customDate || null;
  return new Date(Date.now() + selectedValue).toISOString();
}

function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [originalUrl, setOriginalUrl] = useState("");
  const [expiryOption, setExpiryOption] = useState(null);   // selected ms | "custom" | null
  const [customDate, setCustomDate] = useState("");          // ISO local string for <input type="datetime-local">
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    getUserUrls()
      .then((res) => setUrls(res.data.codes || []))
      .catch(() => toast.error("Failed to load URLs"));
  }, []);

  const activeCount = urls.filter((u) => !isExpired(u.expiresAt)).length;

  const selectedLabel = EXPIRY_OPTIONS.find(
    (o) => o.value === expiryOption
  )?.label ?? "No expiry";

  const submit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    let expiresAt = null;
    if (expiryOption === "custom") {
      if (!customDate) {
        toast.error("Please pick a custom expiry date/time.");
        return;
      }
      expiresAt = new Date(customDate).toISOString();
    } else if (expiryOption) {
      expiresAt = new Date(Date.now() + expiryOption).toISOString();
    }

    setLoading(true);
    try {
      const payload = { url: originalUrl };
      if (expiresAt) payload.expiresAt = expiresAt;

      const res = await createShortUrl(payload);
      setUrls([res.data, ...urls]);
      setOriginalUrl("");
      setExpiryOption(null);
      setCustomDate("");
      toast.success("Short URL created!");
    } catch {
      toast.error("Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (shortCode) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/${shortCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (id) => {
    try {
      await deleteUrl(id);
      setUrls(urls.filter((url) => url.id !== id));
      setDeleteConfirm(null);
      toast.success("URL deleted!");
    } catch {
      toast.error("Failed to delete URL");
    }
  };

  return (
    <div
      className="h-[calc(100vh-52px)] bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300"
      onClick={() => setShowExpiryDropdown(false)}
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex-1 flex flex-col overflow-hidden">

        {/* HEADER & STATS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your URLs</p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <StatItem icon={<LinkIcon className="w-5 h-5" />} label="Total" value={urls.length} />
            <StatItem icon={<TrendingUp className="w-5 h-5" />} label="Active" value={activeCount} />
            <StatItem icon={<BarChart3 className="w-5 h-5" />} label="Clicks" value="—" />
          </div>
        </div>

        {/* CREATE URL FORM */}
        <form onSubmit={submit} className="mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* URL input */}
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="Enter your long URL here..."
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                disabled={loading}
                required
              />

              {/* Expiry picker */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setShowExpiryDropdown((v) => !v)}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium disabled:opacity-50"
                >
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>{selectedLabel}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showExpiryDropdown ? "rotate-180" : ""}`} />
                </button>

                {showExpiryDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    {EXPIRY_OPTIONS.map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => {
                          setExpiryOption(opt.value);
                          setShowExpiryDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 ${
                          expiryOption === opt.value
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Shorten button */}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Shorten</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom date picker — shown only when "Custom…" is selected */}
            {expiryOption === "custom" && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  Expires on:
                </label>
                <input
                  type="datetime-local"
                  value={customDate}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            )}
          </div>
        </form>

        {/* URLS LIST */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto pr-1 sm:pr-2">
            {urls.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3 pb-4">
                {urls.map((url) => (
                  <URLCard
                    key={url.id}
                    url={url}
                    onCopy={copyToClipboard}
                    onDelete={() => setDeleteConfirm(url.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

/* ========== COMPONENTS ========== */

const StatItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 shrink-0 shadow-sm">
    <div className="text-purple-600 dark:text-purple-400">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{value}</p>
    </div>
  </div>
);

const ExpiryBadge = ({ expiresAt }) => {
  if (!expiresAt) return null;

  const expired = isExpired(expiresAt);

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold">
        <Clock className="w-3 h-3" />
        Expired
      </span>
    );
  }

  const diffMs = new Date(expiresAt) - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  const diffHrs  = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  let timeLabel;
  if (diffMins < 60)       timeLabel = `${diffMins}m`;
  else if (diffHrs < 24)   timeLabel = `${diffHrs}h`;
  else                      timeLabel = `${diffDays}d`;

  const isUrgent = diffMs < 3600000; // < 1 hour
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
      isUrgent
        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
    }`}>
      <Clock className="w-3 h-3" />
      Expires in {timeLabel}
    </span>
  );
};

const URLCard = ({ url, onCopy, onDelete }) => {
  const shortUrl = `${import.meta.env.VITE_BACKEND_URL}/${url.shortCode}`;
  const expired = isExpired(url.expiresAt);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border p-4 transition-all shadow-sm ${
      expired
        ? "border-red-200 dark:border-red-900/50 opacity-75"
        : "border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate font-medium">
            {url.targetURL}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => !expired && onCopy(url.shortCode)}
              className={`text-base font-bold transition-colors ${
                expired
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed line-through"
                  : "text-purple-600 dark:text-purple-400 hover:underline"
              }`}
              title={expired ? "This link has expired" : "Click to copy"}
              disabled={expired}
            >
              /{url.shortCode}
            </button>
            {!expired && (
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <ExpiryBadge expiresAt={url.expiresAt} />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
          {!expired && (
            <button
              onClick={() => onCopy(url.shortCode)}
              className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span className="sm:inline">Copy</span>
            </button>
          )}

          <button
            onClick={onDelete}
            className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 sm:p-12 text-center h-full flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">🔗</div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No links yet</h3>
    <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
      Create your first short link using the form above
    </p>
  </div>
);

const DeleteConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 max-w-sm w-full shadow-2xl transform transition-all">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete URL?</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        This action cannot be undone. The short link will stop working immediately.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default Dashboard;