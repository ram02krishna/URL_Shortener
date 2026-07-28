import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Copy, Trash2, ExternalLink, Plus, BarChart2,
  Link as LinkIcon, Loader2, Clock, ChevronDown,
  X, MousePointerClick, Users, RefreshCw,
  QrCode, Lock, AlertTriangle
} from "lucide-react";
import { createShortUrl, getUserUrls, deleteUrl, getUrlAnalytics } from "../services/url.service";
import QRCode from "react-qr-code";
import { getShortUrl } from "../utils/urlFormat";

const EXPIRY_OPTIONS = [
  { label: "No expiry", value: null },
  { label: "1 hour", value: 1 * 60 * 60 * 1000 },
  { label: "24 hours", value: 24 * 60 * 60 * 1000 },
  { label: "7 days", value: 7 * 24 * 60 * 60 * 1000 },
  { label: "30 days", value: 30 * 24 * 60 * 60 * 1000 },
  { label: "Custom", value: "custom" },
];

const isExpired = (expiresAt) => expiresAt && new Date() > new Date(expiresAt);

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const minDateTime = (() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  })();
  const [originalUrl, setOriginalUrl] = useState("");
  const [expiryOption, setExpiryOption] = useState(null);
  const [customDate, setCustomDate] = useState("");
  const [password, setPassword] = useState("");
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [analyticsUrl, setAnalyticsUrl] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  useEffect(() => {
    getUserUrls()
      .then(res => setUrls(res.data.codes || []))
      .catch(() => toast.error("Failed to load links"));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    let expiresAt = null;
    if (expiryOption === "custom") {
      if (!customDate) { toast.error("Please pick an expiry date"); return; }
      expiresAt = new Date(customDate).toISOString();
    } else if (expiryOption) {
      expiresAt = new Date(Date.now() + expiryOption).toISOString();
    }

    setLoading(true);
    try {
      const payload = { url: originalUrl };
      if (expiresAt) payload.expiresAt = expiresAt;
      if (password) payload.password = password;
      const res = await createShortUrl(payload);
      setUrls([res.data, ...urls]);
      setOriginalUrl("");
      setExpiryOption(null);
      setCustomDate("");
      setPassword("");
      toast.success("Link created!");
    } catch {
      toast.error("Failed to create link");
    } finally {
      setLoading(false);
    }
  };

  const copy = (shortCode) => {
    navigator.clipboard.writeText(getShortUrl(shortCode));
    toast.success("Copied!");
  };

  const handleDelete = async (id) => {
    try {
      await deleteUrl(id);
      setUrls(urls.filter(u => u.id !== id));
      setDeleteConfirm(null);
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const selectedLabel = EXPIRY_OPTIONS.find(o => o.value === expiryOption)?.label ?? "No expiry";
  const activeCount = urls.filter(u => !isExpired(u.expiresAt)).length;

  return (
    <div
      className="min-h-screen pt-14"
      onClick={() => setShowExpiryDropdown(false)}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Links</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {urls.length} total · {activeCount} active
            </p>
          </div>
        </div>

        <form onSubmit={submit} onClick={e => e.stopPropagation()} className="card p-4 mb-6">

          <div className="flex gap-2">
            <input
              type="url"
              value={originalUrl}
              onChange={e => setOriginalUrl(e.target.value)}
              placeholder="Paste a long URL to shorten…"
              className="input flex-1 text-sm min-w-0"
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn text-sm shrink-0 px-4"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /><span className="hidden xs:inline">Create</span></>}
            </button>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row gap-2">

            <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowExpiryDropdown(v => !v)}
                className="btn-secondary btn text-sm w-full sm:w-auto gap-2"
                disabled={loading}
              >
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {selectedLabel}
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showExpiryDropdown ? "rotate-180" : ""}`} />
              </button>
              {showExpiryDropdown && (
                <div className="absolute left-0 bottom-full mb-1.5 sm:bottom-auto sm:top-full sm:mt-1.5 w-44 card shadow-lg z-20 py-1">
                  {EXPIRY_OPTIONS.map(opt => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => { setExpiryOption(opt.value); setShowExpiryDropdown(false); }}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                        expiryOption === opt.value
                          ? "bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:text-accent-300 font-medium"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Optional password"
                className="input text-sm pl-9"
                disabled={loading}
              />
            </div>
            {expiryOption === "custom" && (
              <input
                type="datetime-local"
                value={customDate}
                min={minDateTime}
                onChange={e => setCustomDate(e.target.value)}
                className="input text-sm flex-1"
              />
            )}
          </div>
        </form>

        {urls.length === 0 ? (
          <div className="card p-12 text-center">
            <LinkIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No links yet</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Create your first link above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {urls.map(url => (
              <URLRow
                key={url.id}
                url={url}
                onCopy={copy}
                onDelete={() => setDeleteConfirm(url.id)}
                onAnalytics={() => setAnalyticsUrl(url)}
                onQrCode={() => setQrCodeUrl(url)}
              />
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <DeleteModal
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
      {analyticsUrl && (
        <AnalyticsModal url={analyticsUrl} onClose={() => setAnalyticsUrl(null)} />
      )}
      {qrCodeUrl && (
        <QRModal url={qrCodeUrl} onClose={() => setQrCodeUrl(null)} />
      )}
    </div>
  );
};

const ExpiryLabel = ({ expiresAt }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt) - now;
  if (diffMs <= 0) return <span className="badge-red">Expired</span>;

  const d = Math.floor(diffMs / 86400000);
  const h = Math.floor((diffMs % 86400000) / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  const s = Math.floor((diffMs % 60000) / 1000);

  const label = d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
  const urgent = diffMs < 3600000;

  return (
    <span className={urgent ? "badge-amber" : "badge-green"}>
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
};

const URLRow = ({ url, onCopy, onDelete, onAnalytics, onQrCode }) => {
  const shortUrl = getShortUrl(url.shortCode);
  const expired = isExpired(url.expiresAt);

  return (
    <div className={`card p-3 sm:p-4 transition-opacity ${expired ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3">

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-mono font-medium text-accent-600 dark:text-accent-400 truncate max-w-[200px] sm:max-w-none">
              {shortUrl.replace(/^https?:\/\//, '')}
            </span>
            {url.hasPassword && (
              <span className="badge-zinc"><Lock className="w-3 h-3" />Protected</span>
            )}
            <ExpiryLabel expiresAt={url.expiresAt} />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
            {url.targetURL}
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0 -mr-1">
          {!expired && (
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-icon btn-ghost p-2.5"
              title="Open"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {!expired && (
            <button
              onClick={() => onCopy(url.shortCode)}
              className="btn-icon btn-ghost p-2.5"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          <button onClick={onAnalytics} className="btn-icon btn-ghost p-2.5" title="Analytics">
            <BarChart2 className="w-4 h-4" />
          </button>
          <button onClick={onQrCode} className="btn-icon btn-ghost p-2.5" title="QR Code">
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="btn-icon btn-ghost p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Modal = ({ onClose, children, width = "max-w-md" }) => {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`card shadow-xl w-full ${width} animate-slide-up-sheet sm:animate-slide-up max-h-[92dvh] sm:max-h-[90vh] overflow-hidden flex flex-col rounded-t-2xl rounded-b-none sm:rounded-xl`}
        onClick={e => e.stopPropagation()}
      >

        <div className="flex justify-center pt-2.5 pb-0 sm:hidden">
          <div className="w-9 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>
        {children}
      </div>
    </div>
  );
};

const DeleteModal = ({ onConfirm, onCancel }) => (
  <Modal onClose={onCancel} width="max-w-sm">
    <div className="p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Delete this link?</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            This cannot be undone. The short link will stop working.
          </p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-secondary btn btn-sm">Cancel</button>
        <button onClick={onConfirm} className="btn-danger btn btn-sm">Delete</button>
      </div>
    </div>
  </Modal>
);

const AnalyticsModal = ({ url, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getUrlAnalytics(url.id);
      setData(res.data);
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [url.id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetch();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetch]);

  return (
    <Modal onClose={onClose} width="max-w-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-zinc-500" />
            Analytics
          </h3>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">{`/${url.shortCode}`}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={fetch} className="btn-icon btn-ghost" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 overflow-y-auto flex-1">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={fetch} className="btn-secondary btn btn-sm mt-3">Try again</button>
          </div>
        )}
        {data && !loading && (
          <div className="space-y-6">

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total clicks", value: data.totalClicks, icon: MousePointerClick },
                { label: "Unique visitors", value: data.uniqueClicks, icon: Users },
              ].map((item) => {
                const { label, value, icon: Icon } = item;
                return (
                  <div key={label} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1.5">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{label}</span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value?.toLocaleString() ?? 0}</p>
                  </div>
                );
              })}
            </div>

            {data.visitorIps?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Visitor log
                </p>
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                        {["IP", "Browser", "OS", "Device", "Time"].map(h => (
                          <th key={h} className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data.visitorIps.map((row, i) => {
                        const ts = row.clickedAt ? new Date(row.clickedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
                        return (
                          <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <td className="px-3 py-2 font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{row.ip ?? "—"}</td>
                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{row.browser ?? "—"}</td>
                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{row.os ?? "—"}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className="badge-zinc">{row.device ?? "—"}</span>
                            </td>
                            <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">{ts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {data.totalClicks === 0 && (
              <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <MousePointerClick className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No clicks recorded yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

const QRModal = ({ url, onClose }) => {
  const shortUrl = getShortUrl(url.shortCode);

  const download = () => {
    const svg = document.getElementById("qr-svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `qr-${url.shortCode}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(data);
  };

  return (
    <Modal onClose={onClose} width="max-w-xs">
      <div className="p-5 flex flex-col items-center gap-5">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">QR Code</h3>
          <button onClick={onClose} className="btn-icon btn-ghost"><X className="w-4 h-4" /></button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200">
          <QRCode id="qr-svg" value={shortUrl} size={180} />
        </div>

        <p className="text-xs font-mono text-zinc-500 text-center break-all px-2">{shortUrl}</p>

        <button onClick={download} className="btn-secondary btn w-full text-sm">
          <QrCode className="w-4 h-4" />
          Download PNG
        </button>
      </div>
    </Modal>
  );
};

export default Dashboard;
