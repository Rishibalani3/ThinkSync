import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

function ProtectedRoute({ children, isAuthenticated, redirectTo = "/login" }) {
  if (!isAuthenticated) {
    alert("You need to log in first"); // optional
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default ProtectedRoute;
