import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";

const getStaticContent = async (req, res) => {
  try {
    const { key } = req.query;

    if (key) {
      const content = await prisma.staticContent.findUnique({
        where: { key },
      });
      if (!content) {
        return res.status(404).json(new ApiError(404, "Content not found"));
      }
      return res
        .status(200)
        .json(new ApiResponse(200, content, "Content fetched successfully"));
    }

    const contents = await prisma.staticContent.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, contents, "Static content fetched successfully")
      );
  } catch (error) {
    console.error("Get static content error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const upsertStaticContent = async (req, res) => {
  try {
    const { key, title, content, type, metadata } = req.body;

    if (!key || !content) {
      return res
        .status(400)
        .json(new ApiError(400, "Key and content are required"));
    }

    const staticContent = await prisma.staticContent.upsert({
      where: { key },
      update: {
        title,
        content,
        type: type || "text",
        metadata: metadata || null,
        updatedBy: req.user.id,
      },
      create: {
        key,
        title,
        content,
        type: type || "text",
        metadata: metadata || null,
        updatedBy: req.user.id,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: "upsert_static_content",
        targetType: "static_content",
        targetId: staticContent.id,
        metadata: { key },
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, staticContent, "Static content saved successfully")
      );
  } catch (error) {
    console.error("Upsert static content error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const deleteStaticContent = async (req, res) => {
  try {
    const { key } = req.params;

    await prisma.staticContent.delete({ where: { key } });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: "delete_static_content",
        targetType: "static_content",
        metadata: { key },
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Static content deleted successfully"));
  } catch (error) {
    console.error("Delete static content error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export { getStaticContent, upsertStaticContent, deleteStaticContent };
