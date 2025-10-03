import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings";
import PostDetail from "./components/PostDetail";
import Explore from "./components/Explore";
import Connections from "./components/Connections";
import Notifications from "./components/Notifications";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Navbar from "./components/Navbar"; // Your navbar component
import MainLayout from "./layouts/MainLayout";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./utils/ProtectedRoutes";
import { useAuth } from "./contexts/AuthContext";
import NotFound from "./components/UtilComponents/NotFound";
import Bookmarks from "./components/Bookmarks";

function App() {
  const { isAuthenticated, loading, setIsAuthenticated } = useAuth();

  if (loading) return <LoadingScreen />;

  // Guest-accessible routes (will be nested under layout)
  const publicRoutes = [
    { path: "/", element: <Home /> },
    { path: "/explore", element: <Explore /> },
  ];

  // Routes requiring login (nested under layout)
  const protectedRoutes = [
    { path: "/profile", element: <Profile /> },
    { path: "/profile/:username", element: <Profile /> },
    { path: "/settings", element: <Settings /> },
    { path: "/post/:id", element: <PostDetail /> },
    { path: "/connections", element: <Connections /> },
    { path: "/notifications", element: <Notifications /> },
    { path: "/bookmarks", element: <Bookmarks /> },
  ];

  return (
    <Router>
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
            
            {/* App routes under main layout with sidebars */}
            <Route element={<MainLayout />}>
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

              {/* Fallback route inside layout */}
              <Route path="/*" element={<NotFound />} />
            </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
