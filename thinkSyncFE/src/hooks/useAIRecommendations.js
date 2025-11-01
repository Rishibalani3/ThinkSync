import { useCallback } from "react";
import api from "../utils/axios";

const useAIRecommendations = () => {
  /**
   * Get AI-powered topic recommendations for the current user
   */
  const getRecommendedTopics = useCallback(async (limit = 10) => {
    try {
      const res = await api.get(`/ai/topics/recommended?limit=${limit}`);
      return res.data.data?.recommendations || [];
    } catch (err) {
      console.error("Failed to fetch recommended topics", err);
      return [];
    }
  }, []);

  /**
   * Get AI-powered user recommendations (suggested connections)
   */
  const getRecommendedUsers = useCallback(async (limit = 10) => {
    try {
      const res = await api.get(`/ai/users/recommended?limit=${limit}`);
      return res.data.data?.recommendations || [];
    } catch (err) {
      console.error("Failed to fetch recommended users", err);
      return [];
    }
  }, []);

  /**
   * Get AI-powered trending topics
   */
  const getAITrendingTopics = useCallback(async (limit = 10) => {
    try {
      const res = await api.get(`/ai/topics/trending?limit=${limit}`);
      return res.data.data?.topics || [];
    } catch (err) {
      console.error("Failed to fetch AI trending topics", err);
      return [];
    }
  }, []);

  /**
   * Get AI-powered trending posts
   */
  const getAITrendingPosts = useCallback(async (limit = 20) => {
    try {
      const res = await api.get(`/ai/posts/trending?limit=${limit}`);
      return res.data.data?.posts || [];
    } catch (err) {
      console.error("Failed to fetch AI trending posts", err);
      return [];
    }
  }, []);

  return {
    getRecommendedTopics,
    getRecommendedUsers,
    getAITrendingTopics,
    getAITrendingPosts,
  };
};

export default useAIRecommendations;

