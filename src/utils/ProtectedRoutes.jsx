import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

function ProtectedRoute({ children, isAuthenticated, setIsAuthenticated }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      {children}
    </motion.div>
  );
}

export default ProtectedRoute;
