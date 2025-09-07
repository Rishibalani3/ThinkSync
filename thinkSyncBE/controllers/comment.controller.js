import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";

const createComment = async (req, res) => {
  const { content, postId } = req.body;

  try {
    if (!content || !postId) {
      return res.status(400).json(new ApiError(400, "Missing fields"));
    }

    const comment = await prisma.comment.create({
      data: {
        content: content,
        authorId: req.user.id,
        postId: postId,
      },
    });

    return res
      .status(201)
      .json(new ApiResponce(201, comment, "Comment created successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await prisma.comment.findUnique({
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

export { createComment, deleteComment };
