import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../config/db.js";

/**
 * Middleware to ensure user is authenticated and has admin role
 */
export const ensureAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json(new ApiError(401, "Unauthorized. Please log in."));
    }

    // Fetch user details with role
    const userDetails = await prisma.userDetails.findUnique({
      where: { userId: req.user.id },
      select: { role: true },
    });

    // Check if user has admin or moderator role
    const userRole = userDetails?.role || "user";
    if (userRole !== "admin" && userRole !== "moderator") {
      return res.status(403).json(
        new ApiError(403, "Forbidden. Admin access required.")
      );
    }

    // Attach role to request for use in controllers
    req.user.role = userRole;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json(
      new ApiError(500, "Internal server error during authorization check.")
    );
  }
};

/**
 * Middleware to ensure user is authenticated and has admin role only (not moderator)
 */
export const ensureSuperAdmin = async (req, res, next) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json(new ApiError(401, "Unauthorized. Please log in."));
    }

    const userDetails = await prisma.userDetails.findUnique({
      where: { userId: req.user.id },
      select: { role: true },
    });

    const userRole = userDetails?.role || "user";
    if (userRole !== "admin") {
      return res.status(403).json(
        new ApiError(403, "Forbidden. Super admin access required.")
      );
    }

    req.user.role = userRole;
    next();
  } catch (error) {
    console.error("Super admin middleware error:", error);
    return res.status(500).json(
      new ApiError(500, "Internal server error during authorization check.")
    );
  }
};

