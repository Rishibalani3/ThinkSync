import { motion } from "framer-motion";
import { FaBell, FaCheck, FaPalette } from "react-icons/fa";
import { HiOutlineColorSwatch } from "react-icons/hi";
import { useDarkMode } from "../../contexts/DarkModeContext";
import ToggleSwitch from "./ToggleSwitch";

const PreferencesSection = ({ profileData, onInputChange }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const themeOptions = [
    {
      key: "light",
      label: "Light",
      bg: "bg-white",
      border: "border-gray-200",
    },
    {
      key: "dark",
      label: "Dark",
      bg: "bg-gray-800",
      border: "border-gray-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-white">
          <FaPalette size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your experience and notifications
          </p>
        </div>
      </div>

      {/* Theme Selection */}
      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <HiOutlineColorSwatch className="text-purple-500" />
          Theme Preference
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {themeOptions.map((theme) => (
            <motion.button
              key={theme.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // update profileData
                onInputChange("theme", theme.key, "preferences");

                // sync with DarkModeContext
                if (theme.key === "dark" && !isDarkMode) toggleDarkMode();
                if (theme.key === "light" && isDarkMode) toggleDarkMode();
              }}
              className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                profileData.preferences.theme === theme.key
                  ? "border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900 shadow-lg"
                  : `${theme.border} hover:border-gray-300 dark:hover:border-gray-500`
              } ${theme.bg}`}
            >
              <div className="text-center space-y-2">
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {theme.label}
                </div>
                {profileData.preferences.theme === theme.key && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <FaCheck className="mx-auto text-blue-500" size={16} />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FaBell className="text-yellow-500" />
          Notification Settings
        </h3>
        <div className="space-y-3">
          <ToggleSwitch
            enabled={profileData.preferences.notifications.email}
            onChange={(value) =>
              onInputChange("email", value, "preferences.notifications")
            }
            label="Email Notifications"
            description="Receive updates and alerts via email"
          />
          <ToggleSwitch
            enabled={profileData.preferences.notifications.push}
            onChange={(value) =>
              onInputChange("push", value, "preferences.notifications")
            }
            label="Push Notifications"
            description="Get real-time browser notifications"
          />
          <ToggleSwitch
            enabled={profileData.preferences.notifications.marketing}
            onChange={(value) =>
              onInputChange("marketing", value, "preferences.notifications")
            }
            label="Marketing Communications"
            description="Receive promotional content and updates"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PreferencesSection;
