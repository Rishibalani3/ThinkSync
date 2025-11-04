import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";

const getAnnouncements = async (req, res) => {
  try {
    const { isActive } = req.query;
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          announcements,
          "Announcements fetched successfully"
        )
      );
  } catch (error) {
    console.error("Get announcements error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, priority, isActive } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json(new ApiError(400, "Title and content are required"));
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || "info",
        priority: priority || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user.id,
      },
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: "create_announcement",
        targetType: "announcement",
        targetId: announcement.id,
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, announcement, "Announcement created successfully")
      );
  } catch (error) {
    console.error("Create announcement error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, priority, isActive } = req.body;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(type && { type }),
        ...(priority !== undefined && { priority }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: "update_announcement",
        targetType: "announcement",
        targetId: id,
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, announcement, "Announcement updated successfully")
      );
  } catch (error) {
    console.error("Update announcement error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({ where: { id } });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: "delete_announcement",
        targetType: "announcement",
        targetId: id,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Announcement deleted successfully"));
  } catch (error) {
    console.error("Delete announcement error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
