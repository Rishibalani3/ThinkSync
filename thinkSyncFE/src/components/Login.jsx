import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBrain, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";

const Login = ({ setIsAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setUser, refreshAuth } = useAuth();

  // Check if user is authenticated (e.g., after OAuth callback)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/user/me");
        if (res.status === 200 && res.data) {
          setUser(res.data);
          setIsAuthenticated(true);
          navigate("/");
        }
      } catch (err) {
        // User is not authenticated, stay on login page
      }
    };

    // Check auth status on mount and after OAuth callback
    checkAuth();
  }, [navigate, setIsAuthenticated, setUser]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("success") === "true") {
      setSuccessMessage("Registration successful! Please log in.");
      setIsLogin(true);
    }
    if (params.get("error") === "session_error") {
      setSuccessMessage("Session error. Please try logging in again.");
    }
  }, [location.search]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      try {
        const res = await api.post("/auth/login", formData);
        if (res.status === 200 && res.data) {
          // Set user data from response immediately
          if (res.data.user) {
            setUser(res.data.user);
            setIsAuthenticated(true);
          }

          // Refresh auth state to ensure session is working
          // Wait a bit for session to be fully saved to database
          setTimeout(async () => {
            const success = await refreshAuth();
            if (success) {
              navigate("/");
            } else {
              console.error("Session not working after login");
              setSuccessMessage(
                "Login successful but session not established. Please try again."
              );
            }
          }, 500); // Increased timeout to allow database write to complete
        }
      } catch (err) {
        console.log("Login failed:", err.response?.data || err.message);
        setSuccessMessage(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
    } else {
      try {
        const res = await api.post("/auth/signup", {
          username: formData.name,
          email: formData.email,
          password: formData.password,
        });
        if (res.status === 201) {
          window.location.href = `${
            import.meta.env.VITE_FRONTEND_URL
          }/login?success=true`;
        }
      } catch (err) {
        console.log("Registration failed:", err.response?.data || err.message);
      }
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api/v1";
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            <FaBrain className="text-5xl" />
            <span>ThinkSync</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your half-formed ideas with a world of thought.
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          {/* Success message */}
          {successMessage && (
            <div className="mb-4 p-3 text-green-700 bg-green-100 border border-green-300 rounded-md text-sm text-center">
              {successMessage}
            </div>
          )}

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <motion.button
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <FcGoogle className="text-red-500" />
              Continue with Google
            </motion.button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-3 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  required={!isLogin}
                />
              </motion.div>
            )}

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-3 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-3 pr-10 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-end">
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {isLogin ? "Log In" : "Sign Up"}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
