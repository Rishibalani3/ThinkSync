import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdDarkMode, MdLightMode } from "react-icons/md";

import {
  FaBrain,
  FaSearch,
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
} from "react-icons/fa";
import { useDarkMode } from "../contexts/DarkModeContext";

const Navbar = ({ setIsAuthenticated }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality
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
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 h-16 flex items-center justify-between fixed w-full top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400"
          >
            <FaBrain className="text-3xl" />
            <span>ThinkSync</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="text-sm" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <MdDarkMode className="text-xl" />
            ) : (
              <MdLightMode className="text-xl" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Notifications"
          >
            <FaBell className="text-xl" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </motion.button>

          <Link
            to="/profile"
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
          >
            <img
              src="https://placehold.co/32x32/667eea/ffffff?text=JD"
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-gray-700 dark:text-gray-200 hidden lg:block">
              John Doe
            </span>
          </Link>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Logout"
          >
            <FaSignOutAlt className="text-xl" />
          </motion.button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? "auto" : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-16 w-full z-40 overflow-hidden"
      >
        <div className="p-4 space-y-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search thoughts, ideas, questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 pr-10 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </form>

          {/* Mobile Navigation */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="text-lg" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;
