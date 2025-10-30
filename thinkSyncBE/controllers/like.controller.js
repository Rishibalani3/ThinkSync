import { prisma } from "../config/db.js";
import { sendNotification } from "../utils/notification.js";
import { io, userSocketMap } from "../app.js";

const likePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    // Check if user already liked this post
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId: req.user.id,
      },
    });
    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res.status(200).json({ message: "Post unliked" });
    } else {
      const newLike = await prisma.like.create({
        data: { postId, userId: req.user.id },
      });
      // Send notification (don't notify self-like)
      if (req.user.id !== post.authorId) {
        await sendNotification({
          receiverId: post.authorId,
          content: "liked your post",
          senderId: req.user.id,
          postId,
        }, io, userSocketMap);
      }
      return res.status(201).json({ message: "Post liked", like: newLike });
    }
  } catch (err) {
    console.error("Error toggling like:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { likePost };
