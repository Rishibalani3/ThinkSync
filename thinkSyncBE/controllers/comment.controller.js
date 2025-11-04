import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";
import { sendNotification } from "../utils/notification.js";
import { io, userSocketMap } from "../app.js";
import { scheduleModerationCheck } from "../services/backgroundModeration.service.js";

const createComment = async (req, res) => {
  const { content, postId, parentId } = req.body;

  try {
    if (!content || !postId) {
      return res.status(400).json(new ApiError(400, "Missing fields"));
    }

    // if parentId provided, ensure parent exists and belongs to same post
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parent || parent.postId !== postId) {
        return res
          .status(400)
          .json(new ApiError(400, "Invalid parent comment for this post"));
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        status: "okay",
        authorId: req.user.id,
        postId,
        parentId: parentId || null,
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
        likes: true,
      },
    });

    //-----------------------Traking comment activity(For Ai Training) --------------------//

    await prisma.userActivity.create({
      data: {
        userId: req.user.id,
        postId: postId,
        activityType: "comment",
      },
    });

    //----------------------------Sending Notification -----------------//
    // Notify post author (don't notify self)
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && req.user.id !== post.authorId) {
      await sendNotification(
        {
          receiverId: post.authorId,
          content: "commented on your post",
          senderId: req.user.id,
          postId,
          commentId: comment.id,
        },
        io,
        userSocketMap
      );
    }

    // Schedule AI moderation check for 1 minute later
    scheduleModerationCheck(comment.id, "comment", 60000);

    const shaped = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      postId: comment.postId,
      parentId: comment.parentId,
      author: comment.author,
      likesCount: comment.likes.length,
      isLiked: false,
      replies: [],
    };

    return res
      .status(201)
      .json(new ApiResponse(201, shaped, "Comment created successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await prisma.comment.findFirst({
      where: { id: commentId, authorId: req.user.id },
    });

    if (!comment) {
      return res
        .status(404)
        .json(new ApiError(404, "Comment not found or not owned by you"));
    }

    const deletedComment = await prisma.comment.delete({
      where: { id: commentId },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    if (!postId) {
      return res.status(400).json(new ApiError(400, "Missing postId"));
    }

    const userId = req.user?.id || null;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            details: { select: { avatar: true } },
          },
        },
        likes: userId ? { where: { userId } } : false,
        _count: { select: { likes: true, replies: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // build map and tree
    const byId = new Map(
      comments.map((c) => [
        c.id,
        {
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          postId: c.postId,
          parentId: c.parentId || null,
          author: c.author,
          likesCount: c._count?.likes || 0,
          isLiked: userId ? c.likes?.length > 0 : false,
          replies: [],
        },
      ])
    );

    const roots = [];
    byId.forEach((node) => {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId).replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return res
      .status(200)
      .json(new ApiResponse(200, roots, "Comments fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const toggleCommentLike = async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment)
      return res.status(404).json(new ApiError(404, "Comment not found"));

    const existing = await prisma.commentLike.findFirst({
      where: { commentId, userId: req.user.id },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment unliked"));
    }

    const like = await prisma.commentLike.create({
      data: { commentId, userId: req.user.id },
    });

    //-----------------------Traking comment activity(For Ai Training) --------------------//
    await prisma.userActivity.create({
      data: {
        userId: req.user.id,
        postId: comment.postId,
        activityType: "comment_like",
        metadata: { commentId: commentId },
      },
    });

    //----------------------------Sending Notification -----------------//
    // Notify comment author (don't notify self)
    if (req.user.id !== comment.authorId) {
      await sendNotification(
        {
          receiverId: comment.authorId,
          content: "liked your comment",
          senderId: req.user.id,
          postId: comment.postId,
          commentId: commentId,
        },
        io,
        userSocketMap
      );
    }
    return res.status(201).json(new ApiResponse(201, like, "Comment liked"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export { createComment, deleteComment, getComments, toggleCommentLike };
