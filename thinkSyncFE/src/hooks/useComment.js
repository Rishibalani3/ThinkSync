import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/axios";

export default function useComment() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const getComments = async (postId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const res = await api.get(`/comment/${postId}`);
      const comments = res?.data?.data || [];
      return comments;
    } catch (err) {
      console.error(
        "Failed to fetch comments:",
        err.response?.data || err.message
      );
      return [];
    }
  };

  const addComment = async (postId, content, parentId) => {
    if (!isAuthenticated) {
      alert("Please log in first to add a comment.");
      navigate("/login");
      return { error: "unauthenticated" };
    }

    try {
      const res = await api.post("/comment/create", {
        postId,
        content,
        parentId,
      });
      const message = res?.data?.message || "";
      const data = res?.data?.data;
      return { message, data };
    } catch (err) {
      console.error(
        "Failed to add comment:",
        err.response?.data || err.message
      );
      return { error: err };
    }
  };

  const toggleCommentLike = async (commentId) => {
    if (!isAuthenticated) {
      alert("Please log in first to like a comment.");
      navigate("/login");
      return { error: "unauthenticated" };
    }

    try {
      const res = await api.post(`/comment/like/${commentId}`);
      const message = res?.data?.message || "";
      const action = message.toLowerCase().includes("unliked")
        ? "unlike"
        : "like";
      return { action };
    } catch (err) {
      console.error(
        "Failed to toggle comment like:",
        err.response?.data || err.message
      );
      return { error: err };
    }
  };

  const deleteComment = async (commentId) => {
    if (!isAuthenticated) {
      alert("Please log in first to delete a comment.");
      navigate("/login");
      return { error: "unauthenticated" };
    }

    try {
      const res = await api.delete(`/comment/delete/${commentId}`);
      const message = res?.data?.message || "";
      return { message };
    } catch (err) {
      console.error(
        "Failed to delete comment:",
        err.response?.data || err.message
      );
      return { error: err };
    }
  };
  return { getComments, addComment, deleteComment, toggleCommentLike };
}
