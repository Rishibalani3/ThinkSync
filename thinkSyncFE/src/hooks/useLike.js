import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

export default function useLike() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const toggleLike = async (postId) => {
    if (!isAuthenticated) {
      alert("Please log in first to like a post.");
      navigate("/login");
      return { error: "unauthenticated" };
    }

    try {
      const res = await axios.post(
        `http://localhost:3000/likes/like/${postId}`,
        {},
        { withCredentials: true }
      );

      const message = res?.data?.message || "";
      const action = message.toLowerCase().includes("unliked")
        ? "unlike"
        : "like";
      return { action };
    } catch (err) {
      console.error("Failed to toggle like:", err.response?.data || err.message);
      return { error: err };
    }
  };

  return { toggleLike };
}


