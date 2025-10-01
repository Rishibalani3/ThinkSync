import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/axios";

export default function useBookmark() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const toggleBookmark = async (postId) => {
    if (!isAuthenticated) {
      alert("Please log in first to bookmark a post.");
      navigate("/login");
      return { error: "unauthenticated" };
    }

    try {
      const res = await api.post(`/bookmark/create/${postId}`);
      const message = res?.data?.message || "";
      const action = message.toLowerCase().includes("unbookmarked")
        ? "unbookmark"
        : "bookmark";
      return { action };
    } catch (err) {
      console.error(
        "Failed to toggle bookmark:",
        err.response?.data || err.message
      );
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
