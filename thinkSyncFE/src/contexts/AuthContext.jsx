import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/me");

      if (res.status === 200 && res.data) {
        setUser(res.data);
        setIsAuthenticated(true);
        return true; // Success
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
      window.location.href = "/login";
      setUser(null);
      setIsAuthenticated(false);
      alert("Logged out successfully");
    } catch (err) {
      console.log("Logout failed:", err.response?.data || err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated,
        setIsAuthenticated,
        logout,
        refreshAuth: fetchUser, // Expose fetchUser so components can refresh auth state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
