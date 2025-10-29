import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";

const getReports = async (req, res) => {
  try {
    const reports = await prisma.contentreport.findMany({
      include: {
        reporter: true,
        comment: true,
        post: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, reports, "Reports fetched successfully."));
  } catch (err) {
    return res
      .status(500)
      .json(new ApiError(500, "Failed to fetch reports.", err));
  }
};

const createReport = async (req, res) => {
  const { postId, commentID, reason } = req.body;

  try {
    let post = null;
    let comment = null;

    if (!postId && !commentID) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Either postId or commentID must be provided.")
        );
    }

    let isPost = false;
    let report = null;
    if (postId) {
      post = await prisma.post.findUnique({ where: { id: postId } });
      isPost = true;
      if (!post) {
        return res.status(404).json(new ApiError(404, "Post not found."));
      }
    } else if (commentID) {
      comment = await prisma.comment.findUnique({ where: { id: commentID } });
      isPost = false;
      if (!comment) {
        return res.status(404).json(new ApiError(404, "Comment not found."));
      }
    }

    const existingReport = await prisma.contentreport.findFirst({
      where: {
        type: isPost ? "post" : "comment",
        reporterId: req.user.id,
        postId: isPost ? postId : null,
        commentId: isPost ? null : commentID,
        reason: reason,
      },
    });
    if (existingReport) {
      return res
        .status(400)
        .json(new ApiError(400, "You have already reported this."));
    } else {
      report = await prisma.contentreport.create({
        data: {
          type: isPost ? "post" : "comment",
          reporterId: req.user.id,
          postId: isPost ? postId : null,
          commentId: isPost ? null : commentID,
          reason: reason,
          reportedUserId: comment?.authorId || post?.authorId,
        },
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, report, "Report created successfully."));
  } catch (err) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error.", err));
  }
};

const resolveReport = async (req, res) => {
  const { reportId, action } = req.body;

  try {
    const report = await prisma.contentreport.findUnique({
      where: { id: reportId },
    });
    if (!report)
      return res.status(404).json(new ApiError(404, "Report not found."));

    const updated = await prisma.contentreport.update({
      where: { id: reportId },
      data: { status: action === "ban" ? "resolved_ban" : "resolved_dismiss" },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Report resolved successfully."));
  } catch (err) {
    return res
      .status(500)
      .json(new ApiError(500, "Failed to resolve report.", err));
  }
};

export { getReports, createReport, resolveReport };
