import { useCallback } from "react";
import api from "../utils/axios";

const useTopics = () => {
  const getTrendingTopics = useCallback(async () => {
    try {
      const res = await api.get("/topics/trending");

      return res.data.topics || [];
    } catch (err) {
      console.error("Failed to fetch trending topics", err);
      return [];
    }
  }, []);

  const getPostsByTopic = useCallback(async (topicName) => {
    const res = await api.get(`/topics/posts/${encodeURIComponent(topicName)}`);
    
    console.log("Fetched posts for topic:", topicName, res.data.posts);
    return res.data.posts || [];
  }, []);

  const getTrendingPosts = useCallback(async () => {
    try {
      const res = await api.get("/topics/trending-posts");
      return res.data.posts || [];
    } catch (err) {
      console.error("Failed to fetch trending posts", err);
      return [];
    }
  }, []);

  return { getTrendingTopics, getPostsByTopic, getTrendingPosts };
};

export default useTopics;
