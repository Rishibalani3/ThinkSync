import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


 const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notifications.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        sender: { select: { id: true, username: true, displayName: true, details: { select: { avatar: true } } } },
        post: { select: { id: true } },
        comment: { select: { id: true } }
      }
    });
    res.json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

 const markNotificationRead = async (req, res) => {
  try {
    const notif = await prisma.notifications.updateMany({
      where: {
        id: req.params.id,
        receiverId: req.user.id
      },
      data: { seen: true },
    });
    if (notif.count > 0) {
      res.json(new ApiResponse(200, { message: "Marked as read" }, "Notification marked as read"));
    } else {
      res.status(404).json(new ApiError(404, "Notification not found"));
    }
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notif = await prisma.notifications.delete({
      where: { id: req.params.id, receiverId: req.user.id },
    });
    res.json(new ApiResponse(200, { message: "Notification deleted" }, "Notification deleted"));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

export { getNotifications, markNotificationRead, deleteNotification };