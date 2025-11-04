import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";
import { timeAgo } from "../utils/HelperFunction.js";


export const getRecentInteractions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const limit = parseInt(req.query.limit) || 3;

    // Fetch recent activities
    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
        type: { in: ["like", "comment", "view_post", "bookmark"] },
        postId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: limit * 2, // Get more to account for duplicates
    });

    // Extract unique post IDs
    const postIds = [
      ...new Set(activities.map((a) => a.postId).filter(Boolean)),
    ];

    if (postIds.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, [], "Recent interactions fetched successfully")
        );
    }

    // Fetch posts separately since there's no relation
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
        topics: {
          include: { topic: { select: { id: true, name: true } } },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    // Create a map for quick post lookup
    const postMap = new Map(posts.map((post) => [post.id, post]));

    // Transform activities to include post info
    const interactions = activities
      .filter((activity) => activity.postId && postMap.has(activity.postId))
      .map((activity) => {
        const post = postMap.get(activity.postId);
        return {
          id: activity.id,
          type: activity.type,
          post: {
            id: post.id,
            content:
              post.content.substring(0, 200) +
              (post.content.length > 200 ? "..." : ""),
            type: post.type,
            author: {
              displayName: post.author.displayName || post.author.username,
              username: post.author.username,
              avatar: post.author.details?.avatar,
            },
            media: post.media,
            topics: post.topics.map((pt) => pt.topic),
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
          },
          timestamp: timeAgo(activity.createdAt),
          createdAt: activity.createdAt,
        };
      });

    // Remove duplicates (same post, multiple interactions) - keep most recent
    const uniqueInteractions = [];
    const seenPostIds = new Set();
    for (const interaction of interactions) {
      if (!seenPostIds.has(interaction.post.id)) {
        seenPostIds.add(interaction.post.id);
        uniqueInteractions.push(interaction);
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          uniqueInteractions,
          "Recent interactions fetched successfully"
        )
      );
  } catch (error) {
    console.error("Get recent interactions error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};
