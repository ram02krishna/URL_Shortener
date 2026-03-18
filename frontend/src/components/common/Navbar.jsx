import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const showBackButton = location.pathname !== "/";

  // Cycle through themes: light -> dark -> system
  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // ESC to go back
      if (e.key === "Escape" && showBackButton) {
        navigate(-1);
      }
      // Ctrl/Cmd + K for theme toggle
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        cycleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, showBackButton, theme]);

  const getThemeText = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          
          {/* LEFT - Back Button + Logo */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                title="Go back (ESC)"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Shortify
              </span>
            </Link>
          </div>

          {/* RIGHT - Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle - Text Based */}
            <button
              onClick={cycleTheme}
              className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
              title="Toggle theme (Ctrl+K)"
            >
              {getThemeText()}
            </button>

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    location.pathname === "/dashboard"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <Link
                  to="/settings"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    location.pathname === "/settings"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>

                <span className="hidden md:block text-sm text-gray-600 dark:text-gray-400 px-2 border-l border-gray-200 dark:border-gray-700">
                  {user.name}
                </span>

                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
