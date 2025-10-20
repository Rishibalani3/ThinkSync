import { prisma } from "../config/db.js";

const sendMessage = async (req, res) => {
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
      data: {
        senderId,
        receiverId,
        content,
      },
    });

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

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export { sendMessage, getMessages };
