import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { createShortUrlFree } from "../../services/url.service";
import { getOrCreateDeviceId, incrementFreeUses, getRemainingFreeUses } from "../../utils/device";
import { useNavigate } from "react-router-dom";
import { getShortUrl } from "../../utils/urlFormat";

const FreeUrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const navigate = useNavigate();
  const remainingUses = getRemainingFreeUses();

  const submit = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) { toast.error("Please enter a URL"); return; }
    if (remainingUses <= 0) { navigate("/register"); return; }

    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await createShortUrlFree({ url: originalUrl, deviceId });
      incrementFreeUses();
      setShortUrl(getShortUrl(res.data.shortCode));
      toast.success("Done!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Copied!");
  };

  const reset = () => { setOriginalUrl(""); setShortUrl(""); };

  return (
    <div className="w-full">
      {shortUrl ? (
        /* Result state */
        <div className="animate-slide-up space-y-3">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Your shortened link</p>
          <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-sm font-mono font-medium text-accent-600 dark:text-accent-400 truncate hover:underline"
            >
              {shortUrl}
            </a>
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-icon btn-ghost shrink-0"
              title="Open link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={copy} className="btn-primary btn btn-sm shrink-0">
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          </div>
          <button onClick={reset} className="btn-secondary btn w-full text-sm">
            Shorten another
          </button>
        </div>
      ) : remainingUses <= 0 ? (
        /* Out of uses */
        <div className="animate-slide-up text-center py-4 space-y-3">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            You've used all 3 free shortens.
          </p>
          <button onClick={() => navigate("/register")} className="btn-primary btn w-full text-sm">
            Create a free account to continue
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-zinc-400">Unlimited links, analytics, and more.</p>
        </div>
      ) : (
        /* Form state */
        <form onSubmit={submit} className="animate-fade-in space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={originalUrl}
              onChange={e => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              className="input text-sm flex-1"
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn text-sm whitespace-nowrap shrink-0 px-5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Shorten"}
            </button>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {remainingUses} of 3 free uses remaining · No account needed
          </p>
        </form>
      )}
    </div>
  );
};

export default FreeUrlShortener;
