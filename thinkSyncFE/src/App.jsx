import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import PostDetail from "./components/PostDetail";
import Explore from "./components/Explore";
import Connections from "./components/Connections";
import Notifications from "./components/Notifications";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Navbar from "./components/Navbar"; // Your navbar component
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./utils/ProtectedRoutes";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { isAuthenticated, loading, setIsAuthenticated } = useAuth();

  if (loading) return <LoadingScreen />;

  // Guest-accessible routes
  const publicRoutes = [
    { path: "/", element: <Home /> },
    { path: "/explore", element: <Explore /> },
  ];

  // Routes requiring login
  const protectedRoutes = [
    { path: "/profile", element: <Profile /> },
    { path: "/settings", element: <Settings /> },
    { path: "/post/:id", element: <PostDetail /> },
    { path: "/connections", element: <Connections /> },
    { path: "/notifications", element: <Notifications /> },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 transition-colors duration-300">
        {/* Navbar */}
        <Navbar isAuthenticated={isAuthenticated} />

        <AnimatePresence mode="wait">
          <Routes>
            {/* Auth routes */}
            <Route
              path="/login"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Login
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                  />
                </motion.div>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Public routes */}
            {publicRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                  >
                    {element}
                  </motion.div>
                }
              />
            ))}

            {/* Protected routes */}
            {protectedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                    redirectTo="/login"
                  >
                    {element}
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
