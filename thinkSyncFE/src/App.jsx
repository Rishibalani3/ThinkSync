import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PostDetail from "./pages/PostDetail";
import Explore from "./pages/Explore";
import Connections from "./pages/Connections";
import Notifications from "./pages/Notifications";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./utils/ProtectedRoutes";

function App() {
  const { user, loading, setUser, isAuthenticated, setIsAuthenticated } =
    useAuth();
  if (loading) return <LoadingScreen />;

  const protectedRoutes = [
    { path: "/", element: <Home /> },
    { path: "/profile", element: <Profile /> },
    { path: "/settings", element: <Settings /> },
    { path: "/post/:id", element: <PostDetail /> },
    { path: "/explore", element: <Explore /> },
    { path: "/connections", element: <Connections /> },
    { path: "/notifications", element: <Notifications /> },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 transition-colors duration-300">
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/login"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Login setIsAuthenticated={setIsAuthenticated} />
                </motion.div>
              }
            />

            {protectedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                  >
                    {element}
                  </ProtectedRoute>
                }
              />
            ))}
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
