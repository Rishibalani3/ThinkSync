import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { timeAgo } from "../utils/HelperFunction.js";
import { scheduleModerationCheck } from "../services/backgroundModeration.service.js";
import { io } from "../app.js";
const createPost = async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!content || !type) {
      return res.status(400).json(new ApiError(400, "Missing fields"));
    }

    // Parse optional JSON fields safely
    const links = req.body.links ? JSON.parse(req.body.links) : [];
    const mentions = req.body.mentions ? JSON.parse(req.body.mentions) : [];
    const hashtags = req.body.hashtags ? JSON.parse(req.body.hashtags) : [];

    // Handle media uploads safely
    let mediaData = [];
    if (req?.files?.image) {
      const images = Array.isArray(req.files.image)
        ? req.files.image
        : [req.files.image];

      for (const file of images) {
        const url = await uploadOnCloudinary(file.path);
        if (url) {
          mediaData.push({ url, type: "image" });
        }
      }
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        content,
        type,

        status: "under_review",
        authorId: req.user.id,
        media: { create: mediaData },
        links: {
          create: links.map((link) => ({ url: link.url })),
        },
      },
      include: { media: true, links: true },
    });

    // Handle mentions
    if (mentions.length > 0) {
      for (const mention of mentions) {
        const user = await prisma.user.findUnique({
          where: { username: mention.username },
        });
        if (user) {
          await prisma.mention.create({
            data: { postId: post.id, userId: user.id },
          });
        }
      }
    }

    // Handle hashtags → topics
    if (hashtags.length > 0) {
      for (const hashtag of hashtags) {
        const topic = await prisma.topic.upsert({
          where: { name: hashtag.tag },
          create: { name: hashtag.tag },
          update: {},
        });
        await prisma.postTopic.create({
          data: { postId: post.id, topicId: topic.id },
        });
      }
    }

    const fullPost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        media: true,
        links: true,
        mentions: { include: { user: true } },
        topics: { include: { topic: true } },
      },
    });

    scheduleModerationCheck(post.id, "post", 60000);

    // Transform post for real-time broadcast
    const transformedPost = {
      ...fullPost,
      timestamp: timeAgo(fullPost.createdAt || new Date()),
      isLiked: false,
      isBookmarked: false,
      likesCount: 0,
      commentsCount: 0,
    };

    // Emit real-time update to all connected clients
    io.emit("newPost", transformedPost);

    return res
      .status(201)
      .json(new ApiResponse(201, fullPost, "Post created successfully"));
  } catch (err) {
    console.error("Post creation error:", err);
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong: " + err.message));
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const deletedPost = await prisma.$transaction(async (tx) => {
      //find the exising post
      const existingPost = await tx.post.findFirst({
        where: { id: postId, authorId: req.user.id },
      });

      //if post not found or not owned by you
      if (!existingPost) {
        throw new ApiError(404, "Post not found or not owned by you");
      }

      // 2. Delete childrens records (FK)
      await tx.media.deleteMany({ where: { postId } });
      await tx.link.deleteMany({ where: { postId } });
      await tx.postTopic.deleteMany({ where: { postId } });
      await tx.mention.deleteMany({ where: { postId } });

      // 3. Delete post and return it for confirmation
      return tx.post.delete({
        where: { id: postId },
      });
    });

    return res
      .status(200)
      .json(new ApiResponse(200, deletedPost, "Post deleted successfully"));
  } catch (err) {
    console.error("Post deletion error:", err);
    return res
      .status(err.statusCode || 500)
      .json(
        err instanceof ApiError
          ? err
          : new ApiError(500, "Something went wrong: " + err.message)
      );
  }
};

const getFeed = async (req, res) => {
  try {
    const userId = req.user?.id || null; // if used id is null then show default feed
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Fetch posts with relations - exclude flagged posts (unless admin/moderator)
    const feed = await prisma.post.findMany({
      where: {
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
        mentions: {
          include: {
            user: { select: { id: true, username: true, displayName: true } },
          },
        },
        topics: { include: { topic: { select: { id: true, name: true } } } },
        media: true,
        links: true,
        likes: true,
        Bookmark: userId ? { where: { userId } } : false,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });

    const totalPosts = await prisma.post.count({
      where: {
        status: { not: "flagged" }, // Exclude flagged posts from count
      },
    });

    const feedWithState = feed.map((post) => ({
      ...post,
      timestamp: timeAgo(post.createdAt),
      isLiked: userId
        ? post.likes?.some((like) => like.userId === userId)
        : false,
      isBookmarked: userId ? post.Bookmark?.length > 0 : false,
      likesCount: post.likes?.length || 0, //total likes count
      commentsCount: post.comments?.length || 0, // total comments count
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          feed: feedWithState,
          pagination: {
            page,
            limit,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
          },
        },
        "Feed fetched successfully"
      )
    );
  } catch (err) {
    console.error("Feed fetch error:", err);
    return res
      .status(err.statusCode || 500)
      .json(
        err instanceof ApiError
          ? err
          : new ApiError(500, "Something went wrong: " + err.message)
      );
  }
};

const getSinglePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const userId = req.user?.id || null;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: true,
        links: true,
        mentions: { include: { user: true } },
        topics: { include: { topic: true } },
        author: {
          include: {
            details: true,
          },
        },
        likes: userId ? { where: { userId } } : false,
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const transformedPost = {
      id: post.id,
      author: {
        name: post.author?.displayName || post.author?.username,
        username: post.author?.username,
        avatar:
          post.author?.details?.avatar ||
          `https://placehold.co/40x40/667eea/ffffff?text=${
            post.author?.username?.[1] || "U"
          }`,
      },
      content: post.content,
      type: post.type || "idea",
      timestamp: post.createdAt
        ? `${Math.floor(
            (Date.now() - post.createdAt.getTime()) / 3600000
          )} hours ago`
        : "just now",
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
    };

    return res.status(200).json({ post: transformedPost });
  } catch (err) {
    console.error("Post fetch error:", err);
    return res.status(err.statusCode || 500).json({
      error: err.message || "Something went wrong",
    });
  }
};

// --- NEW UTILITY FUNCTION (from previous step) ---
const trackPostView = async (userId, postId) => {
  // 1. Prevent tracking views for guests (if userId is null) or if postId is missing
  if (!userId || !postId) return;

  // Optional: Add logic to prevent recording the same view too often (e.g., within 5 minutes)
  // For simplicity, we'll record every time the frontend calls, trusting the frontend logic.

  try {
    await prisma.userActivity.create({
      data: {
        userId: userId,
        postId: postId,
        type: "view_post", // This is the crucial signal for the AI model
      },
    });
  } catch (error) {
    // Log the error but do NOT throw it to prevent breaking the frontend experience
    console.error("Error tracking post view:", error.message);
  }
};

const recordPostView = async (req, res) => {
  const { postId } = req.params;

  // Check if the user is logged in (assuming req.user is set by middleware)
  const userId = req.user?.id;

  if (!userId) {
    // We shouldn't stop the process for guests, but we can't record activity for them.
    // Return a 401 or just a successful 200/204 if you want the client to not worry.
    // Let's return a simple status to acknowledge the request.
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Guest view request received but not recorded."
        )
      );
  }

  // Check if the post exists
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return res.status(404).json(new ApiError(404, "Post not found."));
  }

  // Call the utility function to record the view in the background
  await trackPostView(userId, postId);

  // Send a simple, fast response back to the frontend
  return res
    .status(204) // 204 No Content is ideal for a successful update without a body
    .send();
};
const getPostStatistics = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    // Get post and verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            Bookmark: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json(new ApiError(404, "Post not found"));
    }

    if (post.authorId !== userId) {
      return res.status(403).json(new ApiError(403, "Only post author can view statistics"));
    }

    // Get view count from UserActivity
    const viewCount = await prisma.userActivity.count({
      where: {
        postId,
        type: "view_post",
      },
    });

    // Get engagement metrics
    const likesCount = post._count.likes;
    const commentsCount = post._count.comments;
    const bookmarksCount = post._count.Bookmark;
    const engagementScore = likesCount + (commentsCount * 1.5) + (bookmarksCount * 0.8) + (viewCount * 0.1);

    // Get recent viewers (last 10, unique by userId)
    const allViewers = await prisma.userActivity.findMany({
      where: {
        postId,
        type: "view_post",
      },
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
      orderBy: { createdAt: "desc" },
    });

    // Get unique viewers (most recent view per user)
    const uniqueViewersMap = new Map();
    allViewers.forEach((view) => {
      if (!uniqueViewersMap.has(view.userId)) {
        uniqueViewersMap.set(view.userId, view.user);
      }
    });
    const recentViewers = Array.from(uniqueViewersMap.values()).slice(0, 10);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          postId,
          views: viewCount,
          likes: likesCount,
          comments: commentsCount,
          bookmarks: bookmarksCount,
          engagementScore: Math.round(engagementScore * 10) / 10,
          recentViewers,
        },
        "Post statistics fetched successfully"
      )
    );
  } catch (error) {
    console.error("Get post statistics error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export { createPost, deletePost, getFeed, getSinglePost, recordPostView, getPostStatistics };
