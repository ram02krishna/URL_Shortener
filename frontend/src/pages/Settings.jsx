import { useState } from "react";
import toast from "react-hot-toast";
import { changePassword } from "../services/auth.service";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    setLoading(true);
    try {
      const res = await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      toast.success(res.data.message || "Password updated");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Settings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{user?.email}</p>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Change password</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Current password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={form.oldPassword}
                  className="input pr-16"
                  onChange={e => setForm({ ...form, oldPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  New password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  minLength={5}
                  value={form.newPassword}
                  className="input"
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Confirm new password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  minLength={5}
                  value={form.confirmPassword}
                  className="input"
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                disabled={loading || !form.oldPassword || !form.newPassword || !form.confirmPassword}
                type="submit"
                className="btn-primary btn text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
