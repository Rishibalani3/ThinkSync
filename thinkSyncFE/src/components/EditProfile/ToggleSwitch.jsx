import { motion } from "framer-motion";

const ToggleSwitch = ({ enabled, onChange, label, description }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
  >
    <div className="flex-1">
      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
        {label}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </div>
    </div>
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 ${
        enabled
          ? "bg-gradient-to-r from-blue-500 to-purple-500"
              : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <motion.span
        animate={{
          translateX: enabled ? 20 : 4,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="inline-block h-5 w-5 rounded-full bg-white shadow-lg"
      />
    </motion.button>
  </motion.div>
);

export default ToggleSwitch;
