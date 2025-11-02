import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";

/**
 * Get all guidelines
 */
export const getGuidelines = async (req, res) => {
  try {
    const { isActive, category } = req.query;
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }
    if (category) {
      where.category = category;
    }

    const guidelines = await prisma.communityGuideline.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return res.status(200).json(
      new ApiResponse(200, guidelines, "Guidelines fetched successfully")
    );
  } catch (error) {
    console.error("Get guidelines error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Create guideline
 */
export const createGuideline = async (req, res) => {
  try {
    const { title, content, category, order, isActive } = req.body;

    if (!title || !content || !category) {
      return res
        .status(400)
        .json(new ApiError(400, "Title, content, and category are required"));
    }

    const guideline = await prisma.communityGuideline.create({
      data: {
        title,
        content,
        category,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedBy: req.user.id,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: "create_guideline",
        targetType: "guideline",
        targetId: guideline.id,
      },
    });

    return res.status(201).json(
      new ApiResponse(201, guideline, "Guideline created successfully")
    );
  } catch (error) {
    console.error("Create guideline error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Update guideline
 */
export const updateGuideline = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, order, isActive } = req.body;

    const guideline = await prisma.communityGuideline.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user.id,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: "update_guideline",
        targetType: "guideline",
        targetId: id,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, guideline, "Guideline updated successfully")
    );
  } catch (error) {
    console.error("Update guideline error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Delete guideline
 */
export const deleteGuideline = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.communityGuideline.delete({ where: { id } });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: "delete_guideline",
        targetType: "guideline",
        targetId: id,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, {}, "Guideline deleted successfully")
    );
  } catch (error) {
    console.error("Delete guideline error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

