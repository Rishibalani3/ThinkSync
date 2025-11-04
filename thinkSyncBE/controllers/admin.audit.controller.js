import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, adminId, action } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (adminId) where.adminId = adminId;
    if (action) where.action = { contains: action };

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Audit logs fetched successfully"
      )
    );
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export { getAuditLogs };
