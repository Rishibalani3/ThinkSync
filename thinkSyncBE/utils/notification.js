import { prisma } from "../config/db.js";

/**
 * Send and persist a notification
 * @param {Object} params e.g. {receiverId, content, senderId, postId, commentId}
 * @param {Object} io - Socket.IO server
 * @param {Object} userSocketMap - userId to socketId map
 * @returns stored notification
 */
export async function sendNotification({ receiverId, content, senderId, postId, commentId = null }, io, userSocketMap) {
  // Persist notification in DB
  const created = await prisma.notifications.create({
    data: {
      content,
      senderId,
      receiverId,
      postId: postId || undefined,
      commentId: commentId || undefined,
    },
  });

  // Fetch notification with sender
  const notif = await prisma.notifications.findUnique({
    where: { id: created.id },
    include: {
      sender: { select: { id: true, username: true, displayName: true, details: { select: { avatar: true } } } },
      post: { select: { id: true } },
      comment: { select: { id: true } }
    }
  });

  // Emit notification to user if online
  const socketId = userSocketMap[receiverId];
  if (socketId) {
    io.to(socketId).emit("newNotification", notif);
  }
  return notif;
}
