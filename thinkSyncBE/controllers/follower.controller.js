import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";
import { sendNotification } from "../utils/notification.js";
import { io, userSocketMap } from "../app.js";

const followUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }
    const existingFollower = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    });
    if (existingFollower) {
      // unfollow
      const deleteFollower = await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: req.user.id,
            followingId: userId,
          },
        },
      });
      return res.status(200).json(new ApiResponse(200, deleteFollower, "User unfollowed"));
    } else {
      // follow
      const follower = await prisma.follows.create({
        data: {
          followerId: req.user.id,
          followingId: userId,
        },
      });
      // Send notification to user you followed (not yourself)
      if (req.user.id !== userId) {
        await sendNotification({
          receiverId: userId,
          content: "started following you",
          senderId: req.user.id,
        }, io, userSocketMap);
      }
      return res.status(201).json(new ApiResponse(201, follower, "User followed"));
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, err.message));
  }
};

const getFollowers = async (req, res) => {
  try {
    const followers = await prisma.follows.findMany({
      where: { followingId: req.user.id },
      include: { follower: true },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, followers, "Followers fetched"));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const getFollowing = async (req, res) => {
  try {
    const following = await prisma.follows.findMany({
      where: { followerId: req.user.id },
      include: { following: true },
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        following.map((f) => f.following),
        "Following fetched"
      )
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export { followUser, getFollowers, getFollowing };
