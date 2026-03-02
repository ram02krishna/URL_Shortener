import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Copy, Trash2, ExternalLink, Plus, TrendingUp,
  Link as LinkIcon, BarChart3, Loader2, Clock, ChevronDown,
  X, Globe, Monitor, Smartphone, MousePointerClick, Users,
  RefreshCw, MapPin, Network, QrCode
} from "lucide-react";
import { createShortUrl, getUserUrls, deleteUrl, getUrlAnalytics } from "../services/url.service";
import QRCode from "react-qr-code";

// Constants
const EXPIRY_OPTIONS = [
  { label: "No expiry", value: null },
  { label: "1 hour",    value: 1 * 60 * 60 * 1000 },
  { label: "24 hours",  value: 24 * 60 * 60 * 1000 },
  { label: "7 days",    value: 7 * 24 * 60 * 60 * 1000 },
  { label: "30 days",   value: 30 * 24 * 60 * 60 * 1000 },
  { label: "Custom…",   value: "custom" },
];

function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}

// Dashboard Component
const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [originalUrl, setOriginalUrl] = useState("");
  const [expiryOption, setExpiryOption] = useState(null);
  const [customDate, setCustomDate] = useState("");
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [analyticsUrl, setAnalyticsUrl] = useState(null); // url object currently viewing analytics
  const [qrCodeUrl, setQrCodeUrl] = useState(null); // url object currently viewing QR code

  useEffect(() => {
    getUserUrls()
      .then((res) => setUrls(res.data.codes || []))
      .catch(() => toast.error("Failed to load URLs"));
  }, []);

  const activeCount = urls.filter((u) => !isExpired(u.expiresAt)).length;

  const selectedLabel = EXPIRY_OPTIONS.find((o) => o.value === expiryOption)?.label ?? "No expiry";

  const submit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    let expiresAt = null;
    if (expiryOption === "custom") {
      if (!customDate) { toast.error("Please pick a custom expiry date/time."); return; }
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
    navigator.clipboard.writeText(`${import.meta.env.VITE_BACKEND_URL}/${shortCode}`);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (id) => {
    try {
      await deleteUrl(id);
      setUrls(urls.filter((u) => u.id !== id));
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
            <StatItem icon={<LinkIcon className="w-5 h-5" />} label="Total"  value={urls.length} />
            <StatItem icon={<TrendingUp className="w-5 h-5" />} label="Active" value={activeCount} />
            <StatItem icon={<BarChart3 className="w-5 h-5" />} label="Clicks" value="—" />
          </div>
        </div>

        {/* CREATE URL FORM */}
        <form onSubmit={submit} className="mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
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
                  className="w-full sm:w-auto flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500 focus:outline-none text-sm font-medium disabled:opacity-50 transition-all"
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
                        onClick={() => { setExpiryOption(opt.value); setShowExpiryDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 ${expiryOption === opt.value ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Creating...</span></> : <><Plus className="w-5 h-5" /><span>Shorten</span></>}
              </button>
            </div>

            {expiryOption === "custom" && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Expires on:</label>
                <input
                  type="datetime-local"
                  value={customDate}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    onAnalytics={() => setAnalyticsUrl(url)}
                    onQrCode={() => setQrCodeUrl(url)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {analyticsUrl && (
        <AnalyticsModal
          url={analyticsUrl}
          onClose={() => setAnalyticsUrl(null)}
        />
      )}

      {qrCodeUrl && (
        <QRCodeModal
          url={qrCodeUrl}
          onClose={() => setQrCodeUrl(null)}
        />
      )}
    </div>
  );
};

// Subcomponents

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
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;

  const diffMs = new Date(expiresAt).getTime() - now;

  if (diffMs <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold">
        <Clock className="w-3 h-3" />Expired
      </span>
    );
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / 1000 / 60) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  const label = parts.join(' ');
  const urgent = diffMs < 3600000;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${urgent ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}`}>
      <Clock className="w-3 h-3" />Expires in {label}
    </span>
  );
};

const URLCard = ({ url, onCopy, onDelete, onAnalytics, onQrCode }) => {
  const shortUrl = `${import.meta.env.VITE_BACKEND_URL}/${url.shortCode}`;
  const expired  = isExpired(url.expiresAt);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border p-4 transition-all shadow-sm ${expired ? "border-red-200 dark:border-red-900/50 opacity-75" : "border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate font-medium">{url.targetURL}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => !expired && onCopy(url.shortCode)}
              disabled={expired}
              className={`text-base font-bold transition-colors ${expired ? "text-gray-400 dark:text-gray-600 cursor-not-allowed line-through" : "text-purple-600 dark:text-purple-400 hover:underline"}`}
              title={expired ? "This link has expired" : "Click to copy"}
            >
              /{url.shortCode}
            </button>
            {!expired && (
              <a href={shortUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" title="Open in new tab">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <ExpiryBadge expiresAt={url.expiresAt} />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
          {/* Analytics button */}
          <button
            onClick={onAnalytics}
            className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 font-medium text-sm flex items-center gap-2 transition-colors"
            title="View Analytics"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="sm:inline">Stats</span>
          </button>

          <button
            onClick={onQrCode}
            className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 font-medium text-sm flex items-center gap-2 transition-colors"
            title="View QR Code"
          >
            <QrCode className="w-4 h-4" />
            <span className="sm:inline">QR</span>
          </button>

          {!expired && (
            <button
              onClick={() => onCopy(url.shortCode)}
              className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Copy className="w-4 h-4" /><span className="sm:inline">Copy</span>
            </button>
          )}

          <button
            onClick={onDelete}
            className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" /><span className="sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Analytics Modal
const AnalyticsModal = ({ url, onClose }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUrlAnalytics(url.id);
      setData(res.data);
    } catch {
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [url.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Analytics
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate mt-0.5">
              /{url.shortCode}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-sm">Loading analytics…</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12 text-red-500">
              <p>{error}</p>
              <button onClick={fetchData} className="mt-3 text-sm underline">Retry</button>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<MousePointerClick className="w-5 h-5" />}
                  label="Total Clicks"
                  value={data.totalClicks}
                  color="purple"
                />
                <StatCard
                  icon={<Users className="w-5 h-5" />}
                  label="Unique Visitors"
                  value={data.uniqueClicks}
                  color="indigo"
                />
              </div>

              {/* Visitor IP Log */}
              {data.visitorIps?.length > 0 && (
                <Section title="Visitor Log" icon={<Network className="w-4 h-4" />}>
                  <VisitorTable rows={data.visitorIps} />
                </Section>
              )}

              {data.totalClicks === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <MousePointerClick className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No clicks yet</p>
                  <p className="text-sm mt-1">Share your link to start seeing stats here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Analytics sub-components

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  };
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
      {icon}{title}
    </h4>
    {children}
  </div>
);

const BarList = ({ items, total }) => {
  const max = Math.max(...items.map((i) => Number(i.count)), 1);
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const pct  = Math.round((Number(item.count) / total) * 100);
        const fill = Math.round((Number(item.count) / max)   * 100);
        return (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-24 truncate text-gray-600 dark:text-gray-400 text-xs font-medium shrink-0">
              {item.label ?? "Unknown"}
            </span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${fill}%` }}
              />
            </div>
            <span className="w-9 text-right text-xs text-gray-500 dark:text-gray-400 font-mono shrink-0">
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

const SparkBar = ({ data }) => {
  const max = Math.max(...data.map((d) => Number(d.count)), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => {
        const h = Math.max(Math.round((Number(d.count) / max) * 100), 4);
        return (
          <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
            <div
              className="w-full rounded-sm bg-purple-500/80 hover:bg-purple-500 transition-all cursor-default"
              style={{ height: `${h}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                {String(d.date).slice(5)}: {d.count}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Visitor IP Table
const VisitorTable = ({ rows }) => {
  const fmt = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 text-left">
            {["IP Address", "Location", "Browser", "OS", "Device", "Time"].map((h) => (
              <th key={h} className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-3 py-2 font-mono text-purple-600 dark:text-purple-400 whitespace-nowrap">
                {row.ip ?? "—"}
              </td>
              <td className="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {[row.city, row.country].filter(Boolean).join(", ") || "Unknown"}
              </td>
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.browser ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.os ?? "—"}</td>
              <td className="px-3 py-2">
                <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                  row.device === "Mobile"  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"  :
                  row.device === "Tablet"  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                                             "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}>{row.device ?? "—"}</span>
              </td>
              <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{fmt(row.clickedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Other Components
const EmptyState = () => (
  <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 sm:p-12 text-center h-full flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">🔗</div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No links yet</h3>
    <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">Create your first short link using the form above</p>
  </div>
);

const DeleteConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 max-w-sm w-full shadow-2xl">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete URL?</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        This action cannot be undone. The short link will stop working immediately.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

const QRCodeModal = ({ url, onClose }) => {
  const shortUrl = `${import.meta.env.VITE_BACKEND_URL}/${url.shortCode}`;
  
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const downloadQrCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${url.shortCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-500" />
            QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 dark:border-gray-200 mx-auto w-fit shadow-sm">
          <QRCode
            id="qr-code-svg"
            value={shortUrl}
            size={200}
            className="rounded"
          />
        </div>
        
        <p className="mt-6 mb-6 text-sm text-gray-500 dark:text-gray-400 font-mono break-all px-2 bg-gray-50 dark:bg-gray-800 py-2 rounded-lg border border-gray-100 dark:border-gray-800">
          {shortUrl}
        </p>
        
        <button
          onClick={downloadQrCode}
          className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <QrCode className="w-4 h-4" />
          Download PNG
        </button>
      </div>
    </div>
  );
};

export default Dashboard;