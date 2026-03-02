import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, ExternalLink, Loader2, Link as LinkIcon, Sparkles } from "lucide-react";
import { createShortUrlFree } from "../../services/url.service";
import { getOrCreateDeviceId, incrementFreeUses, getRemainingFreeUses } from "../../utils/device";
import { useNavigate } from "react-router-dom";

const FreeUrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const navigate = useNavigate();
  const remainingUses = getRemainingFreeUses();

  const submit = async (e) => {
    e.preventDefault();
    
    if (!originalUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    if (remainingUses <= 0) {
      toast.error("You've used all 3 free shortens. Please sign up!");
      navigate("/register");
      return;
    }

    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await createShortUrlFree({ url: originalUrl, deviceId });
      
      incrementFreeUses();
      
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}/${res.data.shortCode}`;
      setShortUrl(fullUrl);
      
      toast.success("URL shortened successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard!");
  };

  const reset = () => {
    setOriginalUrl("");
    setShortUrl("");
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-xl transition-colors duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Try it now
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 w-4 rounded-full transition-colors ${
                        i < remainingUses 
                          ? "bg-purple-500" 
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {remainingUses} / 3 uses left
                </p>
              </div>
            </div>
          </div>
          
          {remainingUses > 0 && (
            <div className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800">
              <Sparkles className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Free</span>
            </div>
          )}
        </div>

        {/* Form */}
        {!shortUrl ? (
          <form onSubmit={submit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="w-full sm:flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={loading || remainingUses <= 0}
                required
              />
              <button
                type="submit"
                disabled={loading || remainingUses <= 0}
                className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="sm:hidden">Processing...</span>
                    <span className="hidden sm:inline">Shortening...</span>
                  </>
                ) : (
                  "Shorten URL"
                )}
              </button>
            </div>

            {/* Info Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 px-2">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border border-transparent dark:border-gray-700">
                ✓ Free forever
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border border-transparent dark:border-gray-700">
                ✓ No account needed
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border border-transparent dark:border-gray-700">
                ✓ {remainingUses} uses left
              </span>
            </div>
          </form>
        ) : (
          /* Result */
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                  Your shortened URL is ready!
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-base font-semibold text-purple-600 dark:text-purple-400 hover:underline break-all p-1"
                >
                  {shortUrl}
                </a>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all flex items-center gap-2"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="sm:hidden text-sm">Copy</span>
                  </button>
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="sm:hidden text-sm">Open</span>
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Shorten Another URL
            </button>

            {remainingUses > 0 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {remainingUses} / 3 free uses remaining
              </p>
            )}
          </div>
        )}

        {/* Out of Uses Prompt */}
        {remainingUses === 0 && !shortUrl && (
          <div className="mt-5 p-5 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              You've used all your free shortens!
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sign up now to get unlimited URL shortening and advanced features
            </p>
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              Sign up for unlimited shortens
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeUrlShortener;
