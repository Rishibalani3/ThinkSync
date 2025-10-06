// controllers/bookmarkController.js
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";

const bookmarkPost = async (req, res) => {
  const { postId } = req.body;

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json(new ApiError(404, "Post not found"));
    }

    const existingBookmark = await prisma.bookmark.findFirst({
      where: { postId, userId: req.user.id },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
      return res
        .status(200)
        .json(new ApiResponce(200, null, "Post unbookmarked"));
    } else {
      const newBookmark = await prisma.bookmark.create({
        data: { postId, userId: req.user.id },
      });
      return res
        .status(201)
        .json(new ApiResponce(201, newBookmark, "Post bookmarked"));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        post: {
          include: {
            author: {
              include: { details: true },
            },
            media: true,
            mentions: {
              include: {
                user: true,
              },
            },
            topics: {
              include: {
                topic: true,
              },
            },
            likes: true, // raw likes
          },
        },
      },
    });

    const posts = bookmarks.map((b) => {
      const p = b.post;

      return {
        ...p,
        likesCount: p.likes.length,
        isLiked: p.likes.some((l) => l.userId === req.user.id),
        isBookmarked: true,
      };
    });

    return res
      .status(200)
      .json(new ApiResponce(200, posts, "Bookmarks fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export { bookmarkPost, getBookmarks };
