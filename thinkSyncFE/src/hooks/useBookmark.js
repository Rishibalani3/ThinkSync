import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/axios";
import { showToast } from "../utils/toast";

export default function useBookmark() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const toggleBookmark = async (postId) => {
    if (!isAuthenticated) {
      showToast.error("Please log in first to bookmark a post.");
      navigate("/login");
      return { error: "unauthenticated" };
    }

    try {
      const res = await api.post(`/bookmark/create/${postId}`);
      
      const message = res?.data?.message || "";
      const action = message.toLowerCase().includes("unbookmarked")
        ? "unbookmark"
        : "bookmark";
      
      // Show toast notification
      if (action === "bookmark") {
        showToast.success("Post bookmarked! 🔖");
      } else {
        showToast.info("Post removed from bookmarks");
      }
      
      return { action, data: res?.data?.data };
    } catch (err) {
      console.error(
        "Failed to toggle bookmark:",
        err.response?.data || err.message
      );
      showToast.error("Failed to bookmark post. Please try again.");
      return { error: err };
    }
  };

  const getBookmarks = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return [];
    }

    try {
      const res = await api.get("/bookmark");
      return res?.data?.data || [];
    } catch (err) {
      console.error(
        "Failed to fetch bookmarks:",
        err.response?.data || err.message
      );
      return [];
    }
  };

  return { toggleBookmark, getBookmarks };
}
