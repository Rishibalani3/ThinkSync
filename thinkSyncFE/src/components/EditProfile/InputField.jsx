import { motion } from "framer-motion";

const InputField = ({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  rows,
  className = "",
}) => {
  const isTextarea = type === "textarea";
  const InputComponent = isTextarea ? "textarea" : "input";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-2 ${className}`}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative group">
        <Icon
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10"
          size={18}
        />
        <InputComponent
          type={isTextarea ? undefined : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={isTextarea ? rows : undefined}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 hover:border-gray-300 dark:hover:border-gray-600 ${
            isTextarea ? "resize-none min-h-[120px]" : ""
          }`}
        />
      </div>
    </motion.div>
  );
};

export default InputField;
