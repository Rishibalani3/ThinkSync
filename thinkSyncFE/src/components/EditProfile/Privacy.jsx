import React from "react";
import { motion } from "framer-motion";
import {
  FaGlobe,
  FaUser,
  FaLock,
  FaShieldAlt,
  FaEye,
  FaCheck,
} from "react-icons/fa";
import { BiEnvelope } from "react-icons/bi";
import ToggleSwitch from "./ToggleSwitch";

const PrivacySection = ({ profileData, onInputChange }) => {
  const visibilityOptions = [
    {
      key: "public",
      label: "Public",
      description: "Anyone can view your profile",
      icon: FaGlobe,
      color: "text-green-500",
    },
    {
      key: "friends",
      label: "Friends Only",
      description: "Only your friends can see your profile",
      icon: FaUser,
      color: "text-blue-500",
    },
    {
      key: "private",
      label: "Private",
      description: "Only you can see your profile",
      icon: FaLock,
      color: "text-red-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl text-white">
          <FaShieldAlt size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Privacy Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Control who can see your information
          </p>
        </div>
      </div>

      {/* Profile Visibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FaEye className="text-purple-500" />
          Profile Visibility
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {visibilityOptions.map((option) => {
            const Icon = option.icon;
            const isSelected =
              profileData.preferences.privacy.profileVisibility === option.key;
            return (
              <motion.button
                key={option.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  onInputChange(
                    "profileVisibility",
                    option.key,
                    "preferences.privacy"
                  )
                }
                className={`p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? "border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={option.color} size={20} />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {option.label}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <FaCheck className="text-blue-500" size={16} />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Contact Information Visibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BiEnvelope className="text-indigo-500" />
          Contact Information
        </h3>
        <div className="space-y-3">
          <ToggleSwitch
            enabled={profileData.preferences.privacy.showEmail}
            onChange={(value) =>
              onInputChange("showEmail", value, "preferences.privacy")
            }
            label="Show Email Address"
            description="Display your email address on your public profile"
          />
          <ToggleSwitch
            enabled={profileData.preferences.privacy.showPhone}
            onChange={(value) =>
              onInputChange("showPhone", value, "preferences.privacy")
            }
            label="Show Phone Number"
            description="Display your phone number on your public profile"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacySection;
