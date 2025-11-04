import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { timeAgo } from "../utils/HelperFunction.js";

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
      .json(new ApiResponse(200, updatedUser, "User details updated"));
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
      where: {
        authorId: userId,
        status: { not: "flagged" }, // Filter out flagged posts
      },
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
        likes: true,
        Bookmark: true,
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
    const userIdForLike = req.user?.id || null;
    const feedWithState = posts.map((post) => ({
      ...post,
      timestamp: timeAgo(post.createdAt),
      isLiked: userIdForLike
        ? post.likes?.some((like) => like.userId === userIdForLike)
        : false,
      isBookmarked: userIdForLike
        ? post.Bookmark?.some((b) => b.userId === userIdForLike)
        : false,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
    }));

    res.json(feedWithState);
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

    // Fetch full user details with public info
    const fullProfileUser = await prisma.user.findUnique({
      where: { id: profileUser.id },
      include: {
        details: {
          select: {
            avatar: true,
            coverImage: true,
            bio: true,
            occupation: true,
            location: true,
            website: true,
            dateOfBirth: true,
            github: true,
            linkedin: true,
            twitter: true,
            warningCount: profileUser.id === loggedInUserId, // Only show to own profile
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    const posts = await prisma.post.findMany({
      where: {
        authorId: profileUser.id,
        status: { not: "flagged" }, // Filter out flagged posts
      },
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
        likes: true,
        Bookmark: true,
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
        comments: true,
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

    // Transform posts with proper state
    const transformedPosts = posts.map((post) => ({
      ...post,
      timestamp: timeAgo(post.createdAt),
      isLiked: loggedInUserId
        ? post.likes?.some((like) => like.userId === loggedInUserId)
        : false,
      isBookmarked: loggedInUserId
        ? post.Bookmark?.some((b) => b.userId === loggedInUserId)
        : false,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
    }));

    // Build social links object
    const socialLinks = {};
    if (fullProfileUser.details?.github)
      socialLinks.github = fullProfileUser.details.github;
    if (fullProfileUser.details?.linkedin)
      socialLinks.linkedin = fullProfileUser.details.linkedin;
    if (fullProfileUser.details?.twitter)
      socialLinks.twitter = fullProfileUser.details.twitter;

    res.json({
      profileUser: {
        ...fullProfileUser,
        details: {
          ...fullProfileUser.details,
          socialLinks,
        },
      },
      posts: transformedPosts,
      isOwnProfile: profileUser.id === loggedInUserId,
      isFollowing,
      followersCount: fullProfileUser._count.followers,
      followingCount: fullProfileUser._count.following,
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

const getModerationHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's 
    const userDetails = await prisma.userDetails.findUnique({
      where: { userId },
      select: { warningCount: true },
    });

    // Get flagged posts and comments by this user
    const flaggedPosts = await prisma.post.findMany({
      where: {
        authorId: userId,
        status: "flagged",
      },
      select: {
        id: true,
        content: true,
        type: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const flaggedComments = await prisma.comment.findMany({
      where: {
        authorId: userId,
        status: "flagged",
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        status: true,
        postId: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const history = [
      ...flaggedPosts.map((post) => ({
        id: post.id,
        type: "post",
        content: post.content.substring(0, 100),
        reason: "Flagged by AI moderation",
        timestamp: timeAgo(post.createdAt),
        createdAt: post.createdAt,
      })),
      ...flaggedComments.map((comment) => ({
        id: comment.id,
        type: "comment",
        content: comment.content.substring(0, 100),
        reason: "Flagged by AI moderation",
        timestamp: timeAgo(comment.createdAt),
        createdAt: comment.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      warningCount: userDetails?.warningCount || 0,
      history,
    });
  } catch (error) {
    console.error("Get moderation history error:", error);
    res.status(500).json({ error: "Failed to fetch moderation history" });
  }
};

export {
  me,
  updateDetails,
  getUserPosts,
  getProfile,
  updateImages,
  getModerationHistory,
};
