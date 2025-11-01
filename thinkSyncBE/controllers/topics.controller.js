import { prisma } from "../config/db.js";
import Fuse from "fuse.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { timeAgo } from "../utils/HelperFunction.js";
import { getTrendingTopics, getTrendingPosts } from "../services/aiRecommendation.service.js";

const fetchPostsByTopic = async (req, res) => {
  const { topicName } = req.params;
  const userId = req.user?.id || null;

  try {
    const posts = await prisma.post.findMany({
      where: {
        topics: { some: { topic: { name: topicName } } },
      },
      orderBy: { createdAt: "desc" },
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

    const transformedPosts = posts.map((post) => ({
      id: post.id,
      author: {
        displayName: post.author?.displayName || post.author?.username,
        username: post.author?.username,
        avatar:
          post.author?.details?.avatar ||
          `https://placehold.co/40x40/667eea/ffffff?text=${
            post.author?.username?.[1] || "U"
          }`,
      },
      content: post.content,
      type: post.type || "idea",

      timestamp: timeAgo(post.createdAt),
      likesCount: post._count?.likes || 0,
      comments: post._count?.comments || 0,
      shares: post.sharesCount || 0,
      tags: post.topics.map((t) => t.topic.name),
      media: post.media,
      links: post.links,
      mentions: post.mentions.map((m) => ({
        id: m.user.id,
        name: m.user.displayName,
        username: m.user.username,
      })),
      isLiked: userId ? post.likes?.length > 0 : false,
      isBookmarked: userId ? post.Bookmark?.length > 0 : false,
    }));

    return res.status(200).json({ posts: transformedPosts });
  } catch (error) {
    console.error("Posts by topic fetch error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchTredingPosts = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const limit = parseInt(req.query.limit) || 20;
    
    // Try to get AI-powered trending posts
    const aiTrending = await getTrendingPosts(limit * 2, 72); // 3 days window
    
    if (aiTrending && aiTrending.length > 0) {
      // Fetch full post details
      const postIds = aiTrending.map((p) => p.post_id);
      const posts = await prisma.post.findMany({
        where: { id: { in: postIds } },
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
            tags: post.topics.map((t) => t.topic.name),
            media: post.media,
            links: post.links,
            mentions: post.mentions.map((m) => ({
              id: m.user.id,
              name: m.user.displayName,
              username: m.user.username,
            })),
            isLiked: userId ? post.likes?.length > 0 : false,
            isBookmarked: userId ? post.Bookmark?.length > 0 : false,
            score: trendingData?.score || 0,
          };
        })
        .sort((a, b) => b.score - a.score) // Maintain AI ranking
        .slice(0, limit); // Take top N

      return res.status(200).json({ posts: transformedPosts });
    }

    // Fallback to simple query if AI service fails
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
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
    
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      author: {
        displayName: post.author?.displayName || post.author?.username,
        username: post.author?.username,
        avatar:
          post.author?.details?.avatar ||
          `https://placehold.co/40x40/667eea/ffffff?text=${post.author?.username?.[0] || "U"}`,
      },
      content: post.content,
      type: post.type || "idea",
      timestamp: timeAgo(post.createdAt),
      likesCount: post._count?.likes || 0,
      comments: post._count?.comments || 0,
      tags: post.topics.map((t) => t.topic.name),
      media: post.media,
      links: post.links,
      mentions: post.mentions.map((m) => ({
        id: m.user.id,
        name: m.user.displayName,
        username: m.user.username,
      })),
      isLiked: userId ? post.likes?.length > 0 : false,
      isBookmarked: userId ? post.Bookmark?.length > 0 : false,
      score: post._count?.likes || 0,
    }));
    
    return res.status(200).json({ posts: transformedPosts });
  } catch (error) {
    console.error("Trending posts error:", error);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

const fetchTredingTopics = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Try to get AI-powered trending topics
    const aiTrending = await getTrendingTopics(limit, 168); // 7 days window
    
    if (aiTrending && aiTrending.length > 0) {
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

      const enrichedTopics = topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        score: trendingMap[topic.id]?.score || 0,
      }));

      // Sort by score (maintain AI ranking)
      enrichedTopics.sort((a, b) => b.score - a.score);

      return res.status(200).json({ topics: enrichedTopics });
    }

    // Fallback to simple query if AI service fails - only topics with posts
    const topics = await prisma.topic.findMany({
      where: {
        posts: {
          some: {}, // Only topics that have at least one post
        },
      },
      orderBy: { _count: { posts: "desc" } },
      take: limit,
      include: { _count: { select: { posts: true } } },
    });
    
    return res.status(200).json({ topics });
  } catch (error) {
    console.error("Trending topics error:", error);
    // Fallback to simple query on error
    try {
      const topics = await prisma.topic.findMany({
        orderBy: { _count: { posts: "desc" } },
        take: 10,
        include: { _count: { select: { posts: true } } },
      });
      return res.status(200).json({ topics });
    } catch (fallbackError) {
      return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
    }
  }
};

const getTopics = async (req, res) => {
  try {
    const userId = req.user?.id; // assuming user ID is available via auth middleware

    // Fetch all topics
    const topics = await prisma.topic.findMany({
      orderBy: { name: "asc" },
    });

    // Fetch user’s selected topics
    const userTopics = await prisma.userTopic.findMany({
      where: { userId },
      select: { topicId: true },
    });
    const userTopicIds = userTopics.map((t) => t.topicId);

    // Map topics and mark selected
    const transformedTopics = topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      isSelected: userTopicIds.includes(topic.id), // ✅ mark if user already selected
    }));

    res.status(200).json(transformedTopics);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch topics", error: err.message });
  }
};

const updateUserTopics = async (req, res) => {
  try {
    const { topicIds } = req.body; // array of selected topic IDs
    const userId = req.user?.id;  
    if (!userId || !Array.isArray(topicIds)) {
      return res
        .status(400)
        .json({ message: "userId and topicIds array required" });
    }

    // 1. Fetch existing user topics
    const existing = await prisma.userTopic.findMany({
      where: { userId },
      select: { topicId: true },
    });
    const existingIds = existing.map((t) => t.topicId);

    // 2. Topics to add
    const toAdd = topicIds.filter((id) => !existingIds.includes(id));
    // 3. Topics to remove
    const toRemove = existingIds.filter((id) => !topicIds.includes(id));

    // 4. Perform DB operations
    if (toAdd.length > 0) {
      await prisma.userTopic.createMany({
        data: toAdd.map((topicId) => ({ userId, topicId })),
        skipDuplicates: true,
      });
    }

    if (toRemove.length > 0) {
      await prisma.userTopic.deleteMany({
        where: {
          userId,
          topicId: { in: toRemove },
        },
      });
    }

    res.status(200).json({ message: "User topics updated" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to update topics", error: err.message });
  }
};

const getUserTopics = async (req, res) => {
  try {
    const { userId } = req.params;
    const topics = await prisma.userTopic.findMany({
      where: { userId },
      include: { topic: true },
    });
    res.status(200).json(topics);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch user topics", error: err.message });
  }
};

export {
  fetchPostsByTopic,
  fetchTredingTopics,
  fetchTredingPosts,
  updateUserTopics,
  getTopics,
  getUserTopics,
};
