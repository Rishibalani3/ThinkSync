import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaHome } from "react-icons/fa";

const NotFound = ({ message = "Page Not Found 😕" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        className="text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-lg"
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-wider"
          initial={{ scale: 0.8 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          404
        </motion.h1>
        <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
          {message}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg transition"
          >
            <FaHome /> Go Home
          </Link>
          <Link
            to={-1}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-2xl shadow-md transition"
          >
            <FaArrowLeft /> Go Back
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
