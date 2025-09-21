import { useState } from "react";
import { motion } from "framer-motion";
import { FaBrain } from "react-icons/fa";
import axios from "axios";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/forgot-password",
        formData
      );

      if (response.status === 200) {
        setMessage(
          "If an account exists with this email, you will receive a password reset email."
        );
        setIsError(false);
        setFormData({ email: "" });
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8"
      >
        <div className="flex items-center justify-center gap-2 text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">
          <FaBrain className="text-5xl" />
          <span>ThinkSync</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Forgot Password
        </h2>

        {/* Message */}
        {message && (
          <p
            className={`p-4 rounded-md text-m font-bold text-center capitalize ${
              isError ? "text-red-500 bg-red-200" : "text-green-500 bg-gray-700"
            } mb-4`}
          >
            {message}
          </p>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Enter your email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="you@example.com"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-3 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
