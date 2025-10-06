import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";

const createComment = async (req, res) => {
  const { content, postId, parentId } = req.body;

  try {
    if (!content || !postId) {
      return res.status(400).json(new ApiError(400, "Missing fields"));
    }

    // if parentId provided, ensure parent exists and belongs to same post
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== postId) {
        return res
          .status(400)
          .json(new ApiError(400, "Invalid parent comment for this post"));
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
        postId,
        parentId: parentId || null,
      },
      include: {
        author: { select: { id: true, username: true, displayName: true, details: { select: { avatar: true } } } },
        likes: true,
      },
    });

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
      .json(new ApiResponce(201, shaped, "Comment created successfully"));
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
        new ApiResponce(200, deletedComment, "Comment deleted successfully")
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
        author: { select: { id: true, username: true, displayName: true, details: { select: { avatar: true } } } },
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
      .json(new ApiResponce(200, roots, "Comments fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const toggleCommentLike = async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json(new ApiError(404, "Comment not found"));

    const existing = await prisma.commentLike.findFirst({
      where: { commentId, userId: req.user.id },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      return res.status(200).json(new ApiResponce(200, null, "Comment unliked"));
    }

    const like = await prisma.commentLike.create({
      data: { commentId, userId: req.user.id },
    });
    return res.status(201).json(new ApiResponce(201, like, "Comment liked"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export { createComment, deleteComment, getComments, toggleCommentLike };
