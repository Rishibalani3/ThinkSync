import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdDarkMode, MdLightMode } from "react-icons/md";

import {
  FaBrain,
  FaSignOutAlt,
  FaBell,
  FaSun,
  FaMoon,
  FaHome,
  FaCompass,
  FaLightbulb,
  FaLink,
  FaCog,
  FaBars,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ setIsAuthenticated }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      navigate("/login");
    } catch (err) {
      console.log("Logout failed:", err.response?.data || err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const navItems = [
    { path: "/", label: "Home", icon: FaHome },
    { path: "/explore", label: "Explore", icon: FaCompass },
    { path: "/profile", label: "My Ideas", icon: FaLightbulb },
    { path: "/connections", label: "Connections", icon: FaLink },
    { path: "/settings", label: "Settings", icon: FaCog },
  ];

  return (
    <>
      {/* Main Floating Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out w-[98%] max-w-7xl`}
      >
        <div
          className={`backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl transition-all duration-500 ${
            isScrolled ? "shadow-2xl" : "shadow-lg"
          }`}
        >
          <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="flex items-center gap-2 text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <FaBrain className="text-2xl lg:text-3xl" />
                </motion.div>
                <span className="hidden sm:block">ThinkSync</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
                      }`}
                    >
                      <Icon className="text-sm" />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-blue-600 rounded-xl -z-10"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              {/* Search - Hidden on mobile */}

              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                <motion.div
                  animate={{ rotate: isDarkMode ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isDarkMode ? (
                    <MdLightMode className="text-lg" />
                  ) : (
                    <MdDarkMode className="text-lg" />
                  )}
                </motion.div>
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                title="Notifications"
              >
                <FaBell className="text-lg" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  3
                </motion.span>
              </motion.button>

              {/* Profile Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 px-3 py-2 rounded-xl transition-all duration-300"
                >
                  <img
                    src="https://placehold.co/32x32/667eea/ffffff?text=JD"
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full ring-2 ring-blue-500/20"
                  />
                  <span className="text-gray-700 dark:text-gray-200 hidden xl:block font-medium">
                    John Doe
                  </span>
                </motion.button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl py-2"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <FaUser className="text-sm" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                      >
                        <FaSignOutAlt className="text-sm" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300"
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? (
                    <FaTimes className="text-lg" />
                  ) : (
                    <FaBars className="text-lg" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed top-24 left-1/2 transform -translate-x-1/2 w-[95%] max-w-md z-40"
          >
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-4">
              {/* Mobile Search */}
              <div className="mb-4">
                <motion.form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                </motion.form>
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
                        }`}
                      >
                        <Icon className="text-lg" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {showProfileMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </>
  );
};

export default Navbar;
