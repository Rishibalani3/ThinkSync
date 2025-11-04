import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";
import { timeAgo } from "../utils/HelperFunction.js";

/**
 * Get all flagged content (posts and comments)
 */
export const getFlaggedContent = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch flagged posts
    const flaggedPosts = type === "comment" ? [] : await prisma.post.findMany({
      where: {
        status: "flagged",
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: parseInt(limit),
    });

    // Fetch flagged comments
    const flaggedComments = type === "post" ? [] : await prisma.comment.findMany({
      where: {
        status: "flagged",
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
        post: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: parseInt(limit),
    });

    // Combine and format
    const flaggedContent = [
      ...flaggedPosts.map((post) => ({
        id: post.id,
        type: "post",
        content: post.content.substring(0, 200),
        author: {
          id: post.author.id,
          username: post.author.username,
          displayName: post.author.displayName,
          avatar: post.author.details?.avatar,
        },
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        createdAt: post.createdAt,
        timestamp: timeAgo(post.createdAt),
      })),
      ...flaggedComments.map((comment) => ({
        id: comment.id,
        type: "comment",
        content: comment.content.substring(0, 200),
        author: {
          id: comment.author.id,
          username: comment.author.username,
          displayName: comment.author.displayName,
          avatar: comment.author.details?.avatar,
        },
        post: comment.post,
        createdAt: comment.createdAt,
        timestamp: timeAgo(comment.createdAt),
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get counts
    const totalFlaggedPosts = await prisma.post.count({
      where: { status: "flagged" },
    });
    const totalFlaggedComments = await prisma.comment.count({
      where: { status: "flagged" },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          content: flaggedContent,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: flaggedContent.length,
            totalPosts: totalFlaggedPosts,
            totalComments: totalFlaggedComments,
          },
        },
        "Flagged content fetched successfully"
      )
    );
  } catch (error) {
    console.error("Get flagged content error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Unflag content (post or comment)
 */
export const unflagContent = async (req, res) => {
  try {
    const { contentId, contentType } = req.body;

    if (!contentId || !contentType) {
      return res.status(400).json(new ApiError(400, "contentId and contentType are required"));
    }

    if (contentType === "post") {
      await prisma.post.update({
        where: { id: contentId },
        data: { status: "okay" },
      });
    } else if (contentType === "comment") {
      await prisma.comment.update({
        where: { id: contentId },
        data: { status: "okay" },
      });
    } else {
      return res.status(400).json(new ApiError(400, "Invalid contentType. Must be 'post' or 'comment'"));
    }

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: `unflag_${contentType}`,
        targetType: contentType,
        targetId: contentId,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, {}, `${contentType} unflagged successfully`)
    );
  } catch (error) {
    console.error("Unflag content error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Delete flagged content (post or comment)
 */
export const deleteFlaggedContent = async (req, res) => {
  try {
    const { contentId, contentType } = req.body;

    if (!contentId || !contentType) {
      return res.status(400).json(new ApiError(400, "contentId and contentType are required"));
    }

    if (contentType === "post") {
      // Delete post and all related data
      await prisma.post.delete({
        where: { id: contentId },
      });
    } else if (contentType === "comment") {
      await prisma.comment.delete({
        where: { id: contentId },
      });
    } else {
      return res.status(400).json(new ApiError(400, "Invalid contentType. Must be 'post' or 'comment'"));
    }

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: `delete_flagged_${contentType}`,
        targetType: contentType,
        targetId: contentId,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, {}, `${contentType} deleted successfully`)
    );
  } catch (error) {
    console.error("Delete flagged content error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

