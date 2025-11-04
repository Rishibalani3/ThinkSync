import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";
import { sendNotification } from "../utils/notification.js";
import { sendMailToUser } from "../utils/SendEmail.js";
import { io, userSocketMap } from "../app.js";

/**
 * Get dashboard analytics
 */
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalReports,
      pendingReports,
      newUsers24h,
      newUsers7d,
      newUsers30d,
      newPosts24h,
      newPosts7d,
      totalTopics,
      bannedUsers,
      suspendedUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.contentreport.count(),
      prisma.contentreport.count({ where: { status: "pending" } }),
      prisma.user.count({ where: { createdAt: { gte: last24Hours } } }),
      prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
      prisma.post.count({ where: { createdAt: { gte: last24Hours } } }),
      prisma.post.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.topic.count(),
      prisma.userDetails.count({ where: { isBanned: true } }),
      prisma.userDetails.count({ where: { isSuspended: true } }),
    ]);

    // Get distinct active users (24h and 7d) - Prisma way
    const activeUsers24hActivities = await prisma.userActivity.findMany({
      where: {
        createdAt: { gte: last24Hours },
        type: { in: ["view_post", "like", "comment", "follow"] },
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    const activeUsers24h = activeUsers24hActivities.length;

    const activeUsers7dActivities = await prisma.userActivity.findMany({
      where: {
        createdAt: { gte: last7Days },
        type: { in: ["view_post", "like", "comment", "follow"] },
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    const activeUsers7d = activeUsers7dActivities.length;

    // Engagement metrics
    const likesCount = await prisma.like.count();
    const bookmarksCount = await prisma.bookmark.count();

    // Report statistics by type
    const reportStats = await prisma.contentreport.groupBy({
      by: ["type", "status"],
      _count: { id: true },
    });

    // Topic activity
    const topTopics = await prisma.topic.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            users: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // Recent activity trends
    const activityTrend = await prisma.userActivity.groupBy({
      by: ["type"],
      _count: { id: true },
      where: {
        createdAt: { gte: last7Days },
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          overview: {
            totalUsers,
            totalPosts,
            totalComments,
            totalReports,
            pendingReports,
            totalTopics,
            bannedUsers,
            suspendedUsers,
            totalEngagement: likesCount + bookmarksCount + totalComments,
          },
          growth: {
            newUsers24h,
            newUsers7d,
            newUsers30d,
            newPosts24h,
            newPosts7d,
            activeUsers24h,
            activeUsers7d,
          },
          reports: {
            stats: reportStats,
            pendingCount: pendingReports,
          },
          topics: topTopics.map((t) => ({
            id: t.id,
            name: t.name,
            postsCount: t._count.posts,
            usersCount: t._count.users,
          })),
          activity: activityTrend,
        },
        "Dashboard stats fetched successfully"
      )
    );
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Get all reports with filtering and pagination
 */
const getReports = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [reports, total] = await Promise.all([
      prisma.contentreport.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              displayName: true,
              details: { select: { avatar: true } },
            },
          },
          reportedUser: {
            select: {
              id: true,
              username: true,
              displayName: true,
              details: { select: { avatar: true } },
            },
          },
          post: {
            select: {
              id: true,
              content: true,
              type: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                },
              },
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.contentreport.count({ where }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          reports,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Reports fetched successfully"
      )
    );
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Resolve a report with an action
 */
const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, note } = req.body; // action: "resolve", "dismiss", "warn", "suspend", "ban"

    const report = await prisma.contentreport.findUnique({
      where: { id: reportId },
      include: {
        reportedUser: true,
        post: true,
        comment: true,
      },
    });

    if (!report) {
      return res.status(404).json(new ApiError(404, "Report not found"));
    }

    if (report.status !== "pending") {
      return res.status(400).json(new ApiError(400, "Report already resolved"));
    }

    let status = "resolved";
    let userAction = null;

    switch (action) {
      case "dismiss":
        status = "dismissed";
        break;
      case "warn":
        status = "warned";
        if (report.reportedUserId) {
          await prisma.userDetails.update({
            where: { userId: report.reportedUserId },
            data: {
              warningCount: { increment: 1 },
            },
          });
          userAction = "warned";
        }
        break;
      case "suspend":
        status = "suspended";
        if (report.reportedUserId) {
          const suspendUntil = new Date();
          suspendUntil.setDate(suspendUntil.getDate() + 7);
          await prisma.userDetails.update({
            where: { userId: report.reportedUserId },
            data: {
              isSuspended: true,
              suspendedUntil: suspendUntil,
              suspensionReason: note || "Violation of community guidelines",
            },
          });
          userAction = "suspended";
        }
        break;
      case "ban":
        status = "banned";
        if (report.reportedUserId) {
          await prisma.userDetails.update({
            where: { userId: report.reportedUserId },
            data: {
              isBanned: true,
              banReason: note || "Severe violation of community guidelines",
            },
          });
          if (report.postId) {
            await prisma.post.delete({ where: { id: report.postId } });
          }
          if (report.commentId) {
            await prisma.comment.delete({ where: { id: report.commentId } });
          }
          userAction = "banned";
        }
        break;
    }

    // Update report
    const updatedReport = await prisma.contentreport.update({
      where: { id: reportId },
      data: {
        status,
        resolvedAt: new Date(),
        resolvedBy: req.user.id,
        resolutionNote: note,
      },
    });

    // Log admin action
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: `report_${action}`,
        targetType: report.type,
        targetId: report.postId || report.commentId || report.reportedUserId,
        metadata: {
          reportId,
          note,
        },
      },
    });

    // Send notification to reported user if action was taken
    if (report.reportedUserId && userAction) {
      const actionMessages = {
        warned:
          "You have received a warning for violating community guidelines.",
        suspended:
          "Your account has been suspended for 7 days due to a violation.",
        banned:
          "Your account has been permanently banned for severe violations.",
      };

      await sendNotification(
        {
          receiverId: report.reportedUserId,
          senderId: req.user.id,
          content: actionMessages[userAction],
        },
        io,
        userSocketMap
      );

      const user = await prisma.user.findUnique({
        where: { id: report.reportedUserId },
        select: { email: true, displayName: true },
      });

      if (user?.email) {
        try {
          await sendMailToUser({
            to: user.email,
            subject: `ThinkSync: Account ${
              userAction.charAt(0).toUpperCase() + userAction.slice(1)
            }`,
            html: `
              <h2>Account ${
                userAction.charAt(0).toUpperCase() + userAction.slice(1)
              }</h2>
              <p>Hello ${user.displayName || "User"},</p>
              <p>${actionMessages[userAction]}</p>
              ${note ? `<p><strong>Reason:</strong> ${note}</p>` : ""}
              <p>If you believe this is a mistake, please contact our support team.</p>
            `,
            text: `${actionMessages[userAction]} ${
              note ? `Reason: ${note}` : ""
            }`,
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedReport, "Report resolved successfully")
      );
  } catch (error) {
    console.error("Resolve report error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role || status) {
      where.details = {};
      if (role) where.details.role = role;
      if (status === "banned") where.details.isBanned = true;
      if (status === "suspended") where.details.isSuspended = true;
      if (status === "active") {
        where.details.isBanned = false;
        where.details.isSuspended = false;
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          details: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              followers: true,
              following: true,
              ContentreportReceived: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users: users.map((u) => ({
            id: u.id,
            username: u.username,
            displayName: u.displayName,
            email: u.email,
            role: u.details?.role || "user",
            isBanned: u.details?.isBanned || false,
            isSuspended: u.details?.isSuspended || false,
            suspendedUntil: u.details?.suspendedUntil,
            warningCount: u.details?.warningCount || 0,
            createdAt: u.createdAt,
            stats: {
              posts: u._count.posts,
              comments: u._count.comments,
              followers: u._count.followers,
              following: u._count.following,
              reportsReceived: u._count.ContentreportReceived,
            },
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Users fetched successfully"
      )
    );
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Manage user (warn, suspend, ban)
 */
const manageUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason, durationDays } = req.body; // action: "warn", "suspend", "ban", "unsuspend", "unban"

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { details: true },
    });

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    let updateData = {};
    let actionMessage = "";

    switch (action) {
      case "warn":
        updateData = {
          warningCount: { increment: 1 },
        };
        actionMessage =
          "You have received a warning for violating community guidelines.";
        break;

      case "suspend":
        const suspendUntil = durationDays
          ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        updateData = {
          isSuspended: true,
          suspendedUntil: suspendUntil,
          suspensionReason: reason || "Violation of community guidelines",
        };
        actionMessage = `Your account has been suspended until ${suspendUntil.toLocaleDateString()}.`;
        break;

      case "unsuspend":
        updateData = {
          isSuspended: false,
          suspendedUntil: null,
          suspensionReason: null,
        };
        actionMessage = "Your account suspension has been lifted.";
        break;

      case "ban":
        updateData = {
          isBanned: true,
          banReason: reason || "Severe violation of community guidelines",
          isSuspended: false, // Remove suspension if banning
          suspendedUntil: null,
        };
        actionMessage = "Your account has been permanently banned.";
        break;

      case "unban":
        updateData = {
          isBanned: false,
          banReason: null,
        };
        actionMessage = "Your account ban has been lifted.";
        break;

      case "promote":
        updateData = {
          role: "moderator",
        };
        actionMessage = "You have been promoted to moderator.";
        break;

      case "demote":
        updateData = {
          role: "user",
        };
        actionMessage = "You have been demoted to regular user.";
        break;

      default:
        return res.status(400).json(new ApiError(400, "Invalid action"));
    }

    await prisma.userDetails.update({
      where: { userId },
      data: updateData,
    });

    // Log admin action
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: `user_${action}`,
        targetType: "user",
        targetId: userId,
        metadata: {
          reason,
          durationDays,
        },
      },
    });

    // Send notification
    if (actionMessage) {
      await sendNotification(
        {
          receiverId: userId,
          senderId: req.user.id,
          content: actionMessage + (reason ? ` Reason: ${reason}` : ""),
        },
        io,
        userSocketMap
      );

      // Send email
      if (user.email) {
        try {
          await sendMailToUser({
            to: user.email,
            subject: `ThinkSync: Account ${
              action.charAt(0).toUpperCase() + action.slice(1)
            }`,
            html: `
              <h2>Account ${
                action.charAt(0).toUpperCase() + action.slice(1)
              }</h2>
              <p>Hello ${user.displayName || "User"},</p>
              <p>${actionMessage}</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
            `,
            text: `${actionMessage} ${reason ? `Reason: ${reason}` : ""}`,
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { success: true },
          "User action completed successfully"
        )
      );
  } catch (error) {
    console.error("Manage user error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export { getDashboardStats, getReports, getUsers, manageUser, resolveReport };
