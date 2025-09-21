import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBrain } from "react-icons/fa";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const params = new URLSearchParams({ token, id });

  const [loading, setLoading] = useState(true); // page loading while checking token
  const [validToken, setValidToken] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/auth/validate-reset-token?${params.toString()}`
        );
        if (res.status === 200) {
          setValidToken(true);
        }
      } catch (err) {
        setIsError(true);
        setMessage(err.response?.data?.message || "Invalid or expired token.");
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      setIsError(true);
      setMessage("No token provided.");
      setLoading(false);
    } else {
      validateToken();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        "http://localhost:3000/auth/reset-password",
        {
          token,
          id,
          password: formData.password,
        }
      );
      if (res.status === 200) {
        setIsError(false);
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 5000);
      }
    } catch (err) {
      setIsError(true);
      setMessage(
        err.response?.data?.message || "Failed to reset password. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">
          <FaBrain className="text-5xl" />
          <span>ThinkSync</span>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Reset Password
        </h2>

        {message && (
          <p
            className={`${
              isError ? "text-red-500" : "text-green-500"
            } mb-4 text-center`}
          >
            {message}
          </p>
        )}

        {validToken && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter new password"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-3 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Confirm new password"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-3 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
