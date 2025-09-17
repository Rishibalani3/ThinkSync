import { prisma } from "../config/db.js";
import { io } from "../app.js";

// Send a new message
export const sendMessage = async (req, res) => {
  const senderId = req.user.id;
  //get receiver id from URL
  const { receiverId } = req.params;
  //get Content from Body
  const { content } = req.body;

  try {
    // Check mutual follow 
    const follows = await prisma.follows.findMany({
      where: {
        OR: [
          { followerId: senderId, followingId: receiverId },
          { followerId: receiverId, followingId: senderId },
        ],
      },
    });

    if (follows.length < 2) {
      return res
        .status(403)
        .json({ error: "Users must follow each other to chat" });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    const room = [senderId, receiverId].sort().join("_");
    io.to(room).emit("receiveMessage", message);

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getMessages = async (req, res) => {
  const userId = req.user.id;
  const { userId: otherId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
