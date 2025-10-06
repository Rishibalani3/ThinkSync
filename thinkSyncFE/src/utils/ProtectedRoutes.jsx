import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { pageVariants } from "./animations";

function ProtectedRoute({ children, isAuthenticated, redirectTo = "/login" }) {
  if (!isAuthenticated) {
    alert("You need to log in first"); // optional
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

export default ProtectedRoute;
