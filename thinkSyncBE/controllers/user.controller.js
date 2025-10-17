import { prisma } from "../config/db.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const updateDetails = async (req, res) => {
  const { displayName, email, username, ...detailsFields } = req.body;

  try {
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== req.user.id) {
        return res
          .status(400)
          .json({ error: "Username is already taken. Please choose another." });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        displayName,
        email,
        username,
        details: {
          update: {
            ...detailsFields,
          },
        },
      },
      include: { details: true },
    });

    return res
      .status(200)
      .json(new ApiResponce(200, updatedUser, "User details updated"));
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

const me = (req, res) => {
  res.json(req.user);
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            details: { select: { avatar: true } },
          },
        },
        media: true,
        links: true,
        mentions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                details: { select: { avatar: true } },
              },
            },
          },
        },
        topics: {
          include: {
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
};

const getProfile = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const { username } = req.params;

    let profileUser;
    if (!username) {
      // If no username provided, return current user's profile
      profileUser = await prisma.user.findUnique({
        where: { id: loggedInUserId },
        select: {
          id: true,
          username: true,
          displayName: true,
          details: { select: { avatar: true } },
          createdAt: true,
        },
      });
    } else {
      profileUser = await prisma.user.findUnique({
        where: { username: username },
        select: {
          id: true,
          username: true,
          displayName: true,
          details: { select: { avatar: true } },
          createdAt: true,
        },
      });
      if (!profileUser)
        return res.status(404).json({ error: "User not found" });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: profileUser.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            details: { select: { avatar: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let isFollowing = false;
    if (username && profileUser.id !== loggedInUserId) {
      const follow = await prisma.follows.findFirst({
        where: {
          followerId: loggedInUserId,
          followingId: profileUser.id,
        },
      });
      isFollowing = !!follow;
    }

    res.json({
      profileUser,
      posts,
      isOwnProfile: profileUser.id === loggedInUserId,
      isFollowing,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const updateImages = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files;
    const updates = {};

    if (files?.avatar?.[0]) {
      const avatarUrl = await uploadOnCloudinary(files.avatar[0]);
      if (avatarUrl) updates.avatar = avatarUrl;
    }
    if (files?.coverImage?.[0]) {
      const coverUrl = await uploadOnCloudinary(files.coverImage[0]);
      if (coverUrl) updates.coverImage = coverUrl;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        details: {
          upsert: {
            create: { ...updates },
            update: { ...updates },
          },
        },
      },
      select: {
        username: true,
        details: {
          select: {
            avatar: true,
            coverImage: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Images updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating images:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { me, updateDetails, getUserPosts, getProfile, updateImages };
