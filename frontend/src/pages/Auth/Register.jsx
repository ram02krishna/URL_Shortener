import { useState } from "react";
import toast from "react-hot-toast";
import { registerUser } from "../../services/auth.service";
import { setToken } from "../../utils/token";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await registerUser(form);

      // Auto-login after successful registration
      const token = res.data?.token || res.data?.data?.token || res.data?.accessToken;

      if (token) {
        setToken(token);
        setUser({ loggedIn: true });
        toast.success("Account created! Welcome to Shortify!");
        navigate("/dashboard");
      } else {
        // Fallback: redirect to login if no token
        toast.success("Account created successfully! Please login.");
        navigate("/login");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] py-8 bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl p-6 sm:p-8 transition-all">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-4 shadow-sm">
              <UserPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign up to start shortening URLs
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  First name
                </label>
                <input
                  placeholder="John"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                  onChange={(e) =>
                    setForm({ ...form, firstname: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Last name
                </label>
                <input
                  placeholder="Doe"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                  onChange={(e) =>
                    setForm({ ...form, lastname: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sm text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 transition-colors disabled:opacity-50"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:underline transition-all">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
