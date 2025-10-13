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
import PostDetail from "./components/PostDetail/PostDetails";
import Explore from "./components/Explore";
import Connections from "./components/Connections";
import Notifications from "./components/Notifications";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import MainLayout from "./layouts/MainLayout";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./utils/ProtectedRoutes";
import { useAuth } from "./contexts/AuthContext";
import NotFound from "./components/UtilComponents/NotFound";
import Bookmarks from "./components/Bookmarks";
import { pageVariants } from "./utils/animations";
import Topics from "./components/Topics";

function App() {
  const { isAuthenticated, loading, setIsAuthenticated } = useAuth();

  if (loading) return <LoadingScreen />;

  const publicRoutes = [
    { path: "/", element: <Home /> },
    { path: "/explore", element: <Explore /> },
  ];

  const protectedRoutes = [
    { path: "/profile", element: <Profile /> },
    { path: "/profile/:username", element: <Profile /> },
    { path: "/settings", element: <Settings /> },
    { path: "/post/:id", element: <PostDetail /> },
    { path: "/connections", element: <Connections /> },
    { path: "/notifications", element: <Notifications /> },
    { path: "/bookmarks", element: <Bookmarks /> },
    { path: "/topics/:selectedTopic", element: <Topics /> },
  ];

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/login"
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                style={{ willChange: "transform, opacity" }}
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

          <Route element={<MainLayout />}>
            {publicRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    style={{ willChange: "transform, opacity" }}
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

            <Route path="/*" element={<NotFound />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
