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
    
    let action;
    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      action = "unlike";
    } else {
      const newLike = await prisma.like.create({
        data: { postId, userId: req.user.id },
      });

      //-----------------------Traking like activity(For Ai Training) --------------------//

      await prisma.userActivity.create({
        data: {
          userId: req.user.id,
          postId: postId,
          type: "like",
        },
      });

      //-----------------Sending Notification -----------------//
      // Send notification (don't notify self-like)
      if (req.user.id !== post.authorId) {
        await sendNotification(
          {
            receiverId: post.authorId,
            content: "liked your post",
            senderId: req.user.id,
            postId,
          },
          io,
          userSocketMap
        );
      }
      action = "like";
    }
    
    // Get updated likes count
    const likesCount = await prisma.like.count({
      where: { postId },
    });
    
    return res.status(action === "like" ? 201 : 200).json({ 
      message: action === "like" ? "Post liked" : "Post unliked",
      data: { likesCount, action }
    });
  } catch (err) {
    console.error("Error toggling like:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { likePost };
