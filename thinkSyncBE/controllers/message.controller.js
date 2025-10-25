import { prisma } from "../config/db.js";

const sendMessage = (io) => async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    const isConnected = await prisma.follows.findFirst({
      where: {
        OR: [
          { followerId: senderId, followingId: receiverId },
          { followerId: receiverId, followingId: senderId },
        ],
      },
    });

    if (!isConnected) {
      return res
        .status(403)
        .json({ message: "You can only message your connections." });
    }

    const message = await prisma.message.create({
      data: { senderId, receiverId, content, read: false },
    });

    const roomId = [senderId, receiverId].sort().join("_");
    io.to(roomId).emit("receiveMessage", message);

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    const isConnected = await prisma.follows.findFirst({
      where: {
        OR: [
          { followerId: userId, followingId: otherUserId },
          { followerId: otherUserId, followingId: userId },
        ],
      },
    });

    if (!isConnected) {
      return res
        .status(403)
        .json({ message: "You can only view messages with your connections." });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    await prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: userId, read: false },
      data: { read: true },
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

const getRecentChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const allMessages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: "desc" },
    });

    const chatMap = new Map();

    allMessages.forEach((msg) => {
      const otherUserId =
        msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, msg);
      }
    });

    const recentChats = await Promise.all(
      Array.from(chatMap.entries()).map(async ([otherUserId, lastMsg]) => {
        const user = await prisma.user.findUnique({
          where: { id: otherUserId },
          omit: {
            password: true,
            email: true,
            googleAccessToken: true,
            googleRefreshToken: true,
            googleId: true,
          },
        });

        return { ...user, lastMessage: lastMsg };
      })
    );

    recentChats.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.json(recentChats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recent chats" });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await prisma.message.count({
      where: { receiverId: userId, read: false },
    });
    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

const markMessagesRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    const result = await prisma.message.updateMany({
      where: {
        OR: [
          { senderId: otherUserId, receiverId: userId, read: false },
          { senderId: userId, receiverId: otherUserId, read: false },
        ],
      },
      data: { read: true },
    });

    res.json({ message: "Messages marked as read", rowsUpdated: result.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

export {
  sendMessage,
  getMessages,
  getRecentChats,
  getUnreadCount,
  markMessagesRead,
};
