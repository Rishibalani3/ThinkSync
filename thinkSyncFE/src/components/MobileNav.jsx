import { motion } from "framer-motion";
import {
  FaHome,
  FaCompass,
  FaLink,
  FaCog,
  FaBell,
  FaUser,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";

const MobileNav = ({ isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: "/", label: "Home", icon: FaHome, auth: false },
    { path: "/explore", label: "Explore", icon: FaCompass, auth: false },
    { path: "/connections", label: "Connections", icon: FaLink, auth: true },
    { path: "/settings", label: "Settings", icon: FaCog, auth: true },
  ];

  const handleNavigate = (path, authRequired) => {
    if (authRequired && !isAuthenticated) {
      alert("Please log in first to access this page!");
      navigate("/login");
      return;
    }
    navigate(path);
  };

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-[101] px-4 pb-4 pointer-events-none">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="max-w-xl mx-auto w-full pointer-events-auto"
      >
        <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/50 rounded-3xl shadow-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            {navItems.map(({ path, label, icon: Icon, auth }) => {
              if (auth && !isAuthenticated) return null;
              const isActive =
                location.pathname === path ||
                (path !== "/" && location.pathname.startsWith(path));
              return (
                <button
                  key={path}
                  onClick={() => handleNavigate(path, auth)}
                  className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-500/10 shadow-sm"
                        : "bg-transparent"
                    }`}
                  >
                    <Icon className="text-base" />
                  </span>
                  {label}
                </button>
              );
            })}

            {isAuthenticated ? (
              <button
                onClick={() => navigate("/notifications")}
                className={`relative flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                  location.pathname.startsWith("/notifications")
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${
                    location.pathname.startsWith("/notifications")
                      ? "bg-blue-50 dark:bg-blue-500/10 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  <FaBell className="text-base" />
                </span>
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex flex-col items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl">
                  <FaUser className="text-base" />
                </span>
                Log in
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileNav;

