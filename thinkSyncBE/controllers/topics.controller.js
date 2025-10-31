import { prisma } from "../config/db.js";
import Fuse from "fuse.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { timeAgo } from "../utils/HelperFunction.js";

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
    const posts = await prisma.post.findMany({
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
        likes: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

const fetchTredingTopics = async (req, res) => {
  // try {
  //   const topics = await prisma.topic.findMany({
  //     orderBy: { _count: { posts: "desc" } },
  //     take: 10,
  //     include: { _count: { select: { posts: true } } },
  //   });
  //   return res.status(200).json({ topics });
  // } catch (error) {
  //   return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  // }

  return res.status(200).json({
    topics: [
      { id: 1, name: "JavaScript" },
      { id: 2, name: "WebDev" },
      { id: 3, name: "ReactJS" },
      { id: 4, name: "NodeJS" },
      { id: 5, name: "CSS" },
    ],
  });
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
