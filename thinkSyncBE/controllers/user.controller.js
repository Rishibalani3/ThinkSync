import { prisma } from "../config/db.js";
import { ApiResponce } from "../utils/ApiResponse.js";

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
      profileUser = await prisma.user.findUnique({
        where: { id: loggedInUserId },
      });
    } else {
      profileUser = await prisma.user.findUnique({
        where: { username },
      });
      if (!profileUser)
        return res.status(404).json({ error: "User not found" });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: profileUser.id },
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
export { me, updateDetails, getUserPosts, getProfile };
