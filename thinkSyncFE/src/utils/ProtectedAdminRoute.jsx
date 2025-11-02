import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import api from "./axios";
import LoadingScreen from "../components/LoadingScreen";

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // Check if user has admin access by trying to fetch dashboard stats
        await api.get("/admin/dashboard/stats");
        setIsAdmin(true);
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          setIsAdmin(false);
        } else {
          // Network or other error, allow through (will show error in component)
          setIsAdmin(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [isAuthenticated]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;

