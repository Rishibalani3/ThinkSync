import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/axios";
import { showToast } from "../utils/toast";

export default function useLike() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const toggleLike = async (postId) => {
    if (!isAuthenticated) {
      showToast.error("Please log in first to like a post.");
      navigate("/login");
      return { error: "unauthenticated" };
    }

    try {
      const res = await api.post(`/likes/like/${postId}`);

      const message = res?.data?.message || "";
      const action = message.toLowerCase().includes("unliked")
        ? "unlike"
        : "like";
      
      // Show toast notification
      if (action === "like") {
        showToast.success("Post liked! ❤️");
      } else {
        showToast.info("Post unliked");
      }
      
      return { action, data: res?.data?.data };
    } catch (err) {
      console.error(
        "Failed to toggle like:",
        err.response?.data || err.message
      );
      showToast.error("Failed to like post. Please try again.");
      return { error: err };
    }
  };

  return { toggleLike };
}
