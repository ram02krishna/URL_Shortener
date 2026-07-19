import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Loader2 } from "lucide-react";
import { verifyPassword } from "../services/url.service";

const ProtectedUrl = () => {
  const { shortCode } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError("Please enter a password"); return; }
    setLoading(true);
    setError("");
    try {
      const { data } = await verifyPassword(shortCode, { password });
      window.location.href = data.targetURL;
    } catch (err) {
      const msg = err.response?.data?.error || "Incorrect password";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-14">
      <div className="w-full max-w-xs animate-slide-up">
        <div className="flex items-center justify-center w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-5 mx-auto">
          <Lock className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Password required</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            This link is password-protected. Enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => { setPassword(e.target.value); if (error) setError(""); }}
              className={`input ${error ? "border-red-400 focus:border-red-500 focus:ring-red-400/30" : ""}`}
              placeholder="Enter password"
              autoFocus
              disabled={loading}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="btn-primary btn w-full"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProtectedUrl;
