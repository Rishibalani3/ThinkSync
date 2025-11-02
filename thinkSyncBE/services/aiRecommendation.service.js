import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";

/**
 * Get AI-powered topic recommendations for a user
 */
export const getTopicRecommendations = async (userId, limit = 10) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/recommend/topics`,
      {
        userId,
        limit,
      }
    );
    return response.data.recommendations || [];
  } catch (error) {
    console.error("AI Topic Recommendations Error:", error.message);
    // Return empty array on error to prevent breaking the app
    return [];
  }
};

/**
 * Get AI-powered user connection recommendations
 */
export const getUserRecommendations = async (userId, limit = 10) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/recommend/users`, {
      userId,
      limit,
    });
    return response.data.recommendations || [];
  } catch (error) {
    console.error("AI User Recommendations Error:", error.message);
    return [];
  }
};

/**
 * Get AI-powered trending topics
 */
export const getTrendingTopics = async (limit = 20, timeWindow = 168) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/trending/topics`, {
      params: { limit, timeWindow },
    });

    return response.data.trending_topics || [];
  } catch (error) {
    console.error("AI Trending Topics Error:", error.message);
    return [];
  }
};

/**
 * Get AI-powered trending posts
 */
export const getTrendingPosts = async (limit = 20, timeWindow = 72) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/trending/posts`, {
      params: { limit, timeWindow },
    });
    return response.data.trending_posts || [];
  } catch (error) {
    console.error("AI Trending Posts Error:", error.message);
    return [];
  }
};

/**
 * Health check for AI service
 */
export const checkAIServiceHealth = async () => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`);
    return response.data.status === "ok";
  } catch (error) {
    return false;
  }
};
