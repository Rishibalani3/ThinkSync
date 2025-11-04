import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";

/**
 * Get active announcements for users (public endpoint)
 */
export const getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return res.status(200).json(
      new ApiResponse(200, announcements, "Active announcements fetched successfully")
    );
  } catch (error) {
    console.error("Get active announcements error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

