import { useState } from "react";
import toast from "react-hot-toast";
import { changePassword } from "../services/auth.service";
import { Settings as SettingsIcon, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    setLoading(true);
    try {
      const res = await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      toast.success(res.data.message || "Password updated successfully.");
      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-purple-500" />
            Account Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your account preferences and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400 font-semibold shadow-sm transition-colors">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Security
              </span>
            </button>
            {/* Can add more tabs here in future like Profile, Notifications */}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Change Password
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      value={form.oldPassword}
                      className="w-full pl-10 pr-12 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                      onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 mt-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      minLength={5}
                      value={form.newPassword}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      minLength={5}
                      value={form.confirmPassword}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    disabled={loading || !form.oldPassword || !form.newPassword || !form.confirmPassword}
                    type="submit"
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <p>Logged in as: <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.email}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
