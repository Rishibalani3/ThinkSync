import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  getTopicRecommendations,
  getUserRecommendations,
  getTrendingTopics,
  getTrendingPosts,
} from "../services/aiRecommendation.service.js";
import { prisma } from "../config/db.js";
import { timeAgo } from "../utils/HelperFunction.js";

/**
 * Get recommended topics for the authenticated user
 */
export const getRecommendedTopics = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(new ApiError(401, "Authentication required"));
    }

    const limit = parseInt(req.query.limit) || 10;
    
    // Get AI recommendations
    const aiRecommendations = await getTopicRecommendations(userId, limit);

    // Fetch full topic details from database
    const topicIds = aiRecommendations.map((rec) => rec.topic_id);
    const topics = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
    });

    // Combine AI scores with topic data
    const recommendationsMap = {};
    aiRecommendations.forEach((rec) => {
      recommendationsMap[rec.topic_id] = rec;
    });

    const enrichedTopics = topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      score: recommendationsMap[topic.id]?.score || 0,
      reason: recommendationsMap[topic.id]?.reason || "Recommended for you",
    }));

    return res.status(200).json(
      new ApiResponse(200, { recommendations: enrichedTopics }, "Topic recommendations fetched")
    );
  } catch (error) {
    console.error("Recommended topics error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Get recommended users to follow
 */
export const getRecommendedUsers = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(new ApiError(401, "Authentication required"));
    }

    const limit = parseInt(req.query.limit) || 10;

    // Get AI recommendations
    let aiRecommendations = await getUserRecommendations(userId, limit);

    // If no AI recommendations, use fallback: find users with similar topics
    if (!aiRecommendations || aiRecommendations.length === 0) {
      // Fallback: Find users who follow similar topics
      const userTopics = await prisma.userTopic.findMany({
        where: { userId },
        select: { topicId: true },
      });

      if (userTopics.length > 0) {
        const topicIds = userTopics.map((ut) => ut.topicId);
        
        // Find other users who follow the same topics
        const similarUsers = await prisma.userTopic.groupBy({
          by: ['userId'],
          where: {
            topicId: { in: topicIds },
            userId: { not: userId },
          },
          _count: {
            userId: true,
          },
          orderBy: {
            _count: {
              userId: 'desc',
            },
          },
          take: limit,
        });

        // Get users that current user already follows
        const following = await prisma.follows.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        });
        const followingSet = new Set(following.map((f) => f.followingId));

        // Filter out already-followed users and create recommendations
        aiRecommendations = similarUsers
          .filter((su) => !followingSet.has(su.userId))
          .map((su) => ({
            user_id: su.userId,
            score: su._count.userId / topicIds.length, // Normalize score
            common_topics_count: su._count.userId,
            reason: `${su._count.userId} common interests`,
          }));
      }
    }

    // Fetch full user details from database
    const userIds = aiRecommendations.map((rec) => rec.user_id);
    
    if (userIds.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, { recommendations: [] }, "No recommendations available")
      );
    }
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        details: {
          select: {
            avatar: true,
            bio: true,
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    // Check if user is already following these users
    const following = await prisma.follows.findMany({
      where: {
        followerId: userId,
        followingId: { in: userIds },
      },
      select: { followingId: true },
    });

    const followingSet = new Set(following.map((f) => f.followingId));

    // Combine AI scores with user data
    const recommendationsMap = {};
    aiRecommendations.forEach((rec) => {
      recommendationsMap[rec.user_id] = rec;
    });

    const enrichedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      avatar:
        user.details?.avatar ||
        `https://placehold.co/40x40/667eea/ffffff?text=${user.username?.[0] || "U"}`,
      bio: user.details?.bio || "",
      followersCount: user._count.followers || 0,
      followingCount: user._count.following || 0,
      isFollowing: followingSet.has(user.id),
      score: recommendationsMap[user.id]?.score || 0,
      reason: recommendationsMap[user.id]?.reason || "Similar interests",
      commonTopicsCount: recommendationsMap[user.id]?.common_topics_count || 0,
    }));

    return res.status(200).json(
      new ApiResponse(200, { recommendations: enrichedUsers }, "User recommendations fetched")
    );
  } catch (error) {
    console.error("Recommended users error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Get trending topics with AI scoring
 */
export const getAITrendingTopics = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5; // Default to 5
    const timeWindow = parseInt(req.query.timeWindow) || 168; // 7 days

    // Get AI trending topics (already limited to top 5 in Python)
    const aiTrending = await getTrendingTopics(limit, timeWindow);

    if (aiTrending.length === 0) {
      // Fallback to simple query if AI service fails - only topics with posts
      const topics = await prisma.topic.findMany({
        where: {
          posts: {
            some: {}, // Only topics that have at least one post
          },
        },
        include: {
          _count: {
            select: {
              users: true,
              posts: true,
            },
          },
        },
        orderBy: {
          posts: {
            _count: "desc",
          },
        },
        take: limit,
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            topics: topics.map((topic) => ({
              id: topic.id,
              name: topic.name,
              score: topic._count.posts || 0,
              metrics: {
                users: topic._count.users || 0,
                posts: topic._count.posts || 0,
              },
            })),
          },
          "Trending topics fetched (fallback)"
        )
      );
    }

    // Fetch full topic details
    const topicIds = aiTrending.map((t) => t.topic_id);
    const topics = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
    });

    // Combine AI scores with topic data
    const trendingMap = {};
    aiTrending.forEach((t) => {
      trendingMap[t.topic_id] = t;
    });

    const enrichedTopics = topics.map((topic) => {
      const trendingData = trendingMap[topic.id];
      return {
        id: topic.id,
        name: topic.name,
        score: trendingData?.score || 0,
        metrics: trendingData?.metrics || {},
      };
    });

    // Sort by score (maintain AI ranking)
    enrichedTopics.sort((a, b) => b.score - a.score);

    return res.status(200).json(
      new ApiResponse(200, { topics: enrichedTopics }, "Trending topics fetched")
    );
  } catch (error) {
    console.error("Trending topics error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Get trending posts with AI scoring
 */
export const getAITrendingPosts = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const limit = parseInt(req.query.limit) || 3; // Default to 3
    const timeWindow = parseInt(req.query.timeWindow) || 72; // 3 days

    // Get AI trending posts (already limited to top 3 in Python)
    const aiTrending = await getTrendingPosts(limit, timeWindow);

    if (aiTrending.length === 0) {
      // Fallback to simple query if AI service fails - only posts with engagement
      const posts = await prisma.post.findMany({
        where: {
          OR: [
            { likes: { some: {} } }, // Has at least one like
            { comments: { some: {} } }, // Has at least one comment
          ],
          status: { not: "flagged" }, // Filter out flagged posts
          createdAt: {
            gte: new Date(Date.now() - 72 * 60 * 60 * 1000), // Last 72 hours
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              details: { select: { avatar: true } },
            },
          },
          media: true,
          links: true,
          mentions: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  details: { select: { avatar: true } },
                },
              },
            },
          },
          topics: { include: { topic: { select: { id: true, name: true } } } },
          likes: userId ? { where: { userId } } : false,
          Bookmark: userId ? { where: { userId } } : false,
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: [
          { likes: { _count: "desc" } },
          { comments: { _count: "desc" } },
          { createdAt: "desc" },
        ],
        take: limit,
      });

      const transformedPosts = posts.map((post) => ({
        id: post.id,
        author: {
          displayName: post.author?.displayName || post.author?.username,
          username: post.author?.username,
          avatar:
            post.author?.details?.avatar ||
            `https://placehold.co/40x40/667eea/ffffff?text=${
              post.author?.username?.[0] || "U"
            }`,
        },
        content: post.content,
        type: post.type || "idea",
        timestamp: timeAgo(post.createdAt),
        likesCount: post._count?.likes || 0,
        comments: post._count?.comments || 0,
        tags: post.topics.map((t) => t.topic.name),
        media: post.media,
        links: post.links,
        mentions: post.mentions?.map((m) => ({
          id: m.user.id,
          name: m.user.displayName,
          username: m.user.username,
        })) || [],
        isLiked: userId ? post.likes?.length > 0 : false,
        isBookmarked: userId ? post.Bookmark?.length > 0 : false,
        score: (post._count?.likes || 0) + (post._count?.comments || 0) * 1.5,
      }));

      return res.status(200).json(
        new ApiResponse(200, { posts: transformedPosts }, "Trending posts fetched (fallback)")
      );
    }

    // Fetch full post details
    const postIds = aiTrending.map((p) => p.post_id);
    const posts = await prisma.post.findMany({
      where: { 
        id: { in: postIds },
        status: { not: "flagged" }, // Filter out flagged posts
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            details: { select: { avatar: true } },
          },
        },
        media: true,
        links: true,
        mentions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                details: { select: { avatar: true } },
              },
            },
          },
        },
        topics: { include: { topic: { select: { id: true, name: true } } } },
        likes: userId ? { where: { userId } } : false,
        Bookmark: userId ? { where: { userId } } : false,
        _count: { select: { likes: true, comments: true } },
      },
    });

    // Combine AI scores with post data
    const trendingMap = {};
    aiTrending.forEach((p) => {
      trendingMap[p.post_id] = p;
    });

    const transformedPosts = posts
      .map((post) => {
        const trendingData = trendingMap[post.id];
        return {
          id: post.id,
          author: {
            displayName: post.author?.displayName || post.author?.username,
            username: post.author?.username,
            avatar:
              post.author?.details?.avatar ||
              `https://placehold.co/40x40/667eea/ffffff?text=${
                post.author?.username?.[0] || "U"
              }`,
          },
          content: post.content,
          type: post.type || "idea",
          timestamp: timeAgo(post.createdAt),
          likesCount: post._count?.likes || 0,
          comments: post._count?.comments || 0,
          tags: (post.topics || []).map((t) => t.topic.name),
          media: post.media || [],
          links: post.links || [],
          mentions: (post.mentions || []).map((m) => ({
            id: m.user?.id,
            name: m.user?.displayName,
            username: m.user?.username,
          })),
          isLiked: userId ? post.likes?.length > 0 : false,
          isBookmarked: userId ? post.Bookmark?.length > 0 : false,
          score: trendingData?.score || 0,
          metrics: trendingData?.metrics || {},
        };
      })
      .sort((a, b) => b.score - a.score) // Maintain AI ranking
      .slice(0, limit); // Take top N

    return res.status(200).json(
      new ApiResponse(200, { posts: transformedPosts }, "Trending posts fetched")
    );
  } catch (error) {
    console.error("Trending posts error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

