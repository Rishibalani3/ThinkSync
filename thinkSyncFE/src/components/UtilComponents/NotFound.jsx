import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaHome } from "react-icons/fa";

const NotFound = ({ message = "Page Not Found 😕" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <motion.div
        className="text-center bg-transparent rounded-2xl p-8 max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h1
          className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3"
          initial={{ scale: 0.9 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          404
        </motion.h1>
        <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">
          {message}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <FaHome /> Go Home
          </Link>
          <Link
            to={-1}
            className="flex items-center gap-2 px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium rounded-lg transition"
          >
            <FaArrowLeft /> Go Back
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
