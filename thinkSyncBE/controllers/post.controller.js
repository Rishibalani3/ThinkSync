import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { timeAgo } from "../utils/HelperFunction.js";
const createPost = async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!content || !type) {
      return res.status(400).json(new ApiError(400, "Missing fields"));
    }

    // Parse optional JSON fields safely
    const links = req.body.links ? JSON.parse(req.body.links) : [];
    const mentions = req.body.mentions ? JSON.parse(req.body.mentions) : [];
    const hashtags = req.body.hashtags ? JSON.parse(req.body.hashtags) : [];

    // Handle media uploads safely
    let mediaData = [];
    if (req?.files?.image) {
      const images = Array.isArray(req.files.image)
        ? req.files.image
        : [req.files.image];

      for (const file of images) {
        const url = await uploadOnCloudinary(file.path);
        if (url) {
          mediaData.push({ url, type: "image" });
        }
      }
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        content,
        type,
        authorId: req.user.id,
        media: { create: mediaData },
        links: {
          create: links.map((link) => ({ url: link.url })),
        },
      },
      include: { media: true, links: true },
    });

    // Handle mentions
    if (mentions.length > 0) {
      for (const mention of mentions) {
        const user = await prisma.user.findUnique({
          where: { username: mention.username },
        });
        if (user) {
          await prisma.mention.create({
            data: { postId: post.id, userId: user.id },
          });
        }
      }
    }

    // Handle hashtags → topics
    if (hashtags.length > 0) {
      for (const hashtag of hashtags) {
        const topic = await prisma.topic.upsert({
          where: { name: hashtag.tag },
          create: { name: hashtag.tag },
          update: {},
        });
        await prisma.postTopic.create({
          data: { postId: post.id, topicId: topic.id },
        });
      }
    }

    // Fetch full post with all relations
    const fullPost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        media: true,
        links: true,
        mentions: { include: { user: true } },
        topics: { include: { topic: true } },
      },
    });

    return res
      .status(201)
      .json(new ApiResponce(201, fullPost, "Post created successfully"));
  } catch (err) {
    console.error("Post creation error:", err);
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong: " + err.message));
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const deletedPost = await prisma.$transaction(async (tx) => {
      //find the exising post
      const existingPost = await tx.post.findFirst({
        where: { id: postId, authorId: req.user.id },
      });

      //if post not found or not owned by you
      if (!existingPost) {
        throw new ApiError(404, "Post not found or not owned by you");
      }

      // 2. Delete childrens records (FK)
      await tx.media.deleteMany({ where: { postId } });
      await tx.link.deleteMany({ where: { postId } });
      await tx.postTopic.deleteMany({ where: { postId } });
      await tx.mention.deleteMany({ where: { postId } });

      // 3. Delete post and return it for confirmation
      return tx.post.delete({
        where: { id: postId },
      });
    });

    return res
      .status(200)
      .json(new ApiResponce(200, deletedPost, "Post deleted successfully"));
  } catch (err) {
    console.error("Post deletion error:", err);
    return res
      .status(err.statusCode || 500)
      .json(
        err instanceof ApiError
          ? err
          : new ApiError(500, "Something went wrong: " + err.message)
      );
  }
};

const getFeed = async (req, res) => {
  try {
    const userId = req.user?.id || null; // if used id is null then show default feed
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Fetch posts with relations
    const feed = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            details: { select: { avatar: true } },
          },
        },
        mentions: {
          include: {
            user: { select: { id: true, username: true, displayName: true } },
          },
        },
        topics: { include: { topic: { select: { id: true, name: true } } } },
        media: true,
        links: true,
        likes: userId ? { where: { userId } } : false,
        Bookmark: userId ? { where: { userId } } : false,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });

    const totalPosts = await prisma.post.count();

    const feedWithState = feed.map((post) => ({
      ...post,
      timestamp: timeAgo(post.createdAt),
      isLiked: userId ? post.likes?.length > 0 : false,
      isBookmarked: userId ? post.Bookmark?.length > 0 : false,
      likesCount: post.likes?.length || 0, // optional: total likes count
      Bookmark: undefined, // remove raw bookmark array
    }));

    return res.status(200).json(
      new ApiResponce(
        200,
        {
          feed: feedWithState,
          pagination: {
            page,
            limit,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
          },
        },
        "Feed fetched successfully"
      )
    );
  } catch (err) {
    console.error("Feed fetch error:", err);
    return res
      .status(err.statusCode || 500)
      .json(
        err instanceof ApiError
          ? err
          : new ApiError(500, "Something went wrong: " + err.message)
      );
  }
};

const getSinglePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const userId = req.user?.id || null;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: true,
        links: true,
        mentions: { include: { user: true } },
        topics: { include: { topic: true } },
        author: {
          include: {
            details: true,
          },
        },
        likes: userId ? { where: { userId } } : false,
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const transformedPost = {
      id: post.id,
      author: {
        name: post.author?.displayName || post.author?.username,
        username: post.author?.username,
        avatar:
          post.author?.details?.avatar ||
          `https://placehold.co/40x40/667eea/ffffff?text=${
            post.author?.username?.[1] || "U"
          }`,
      },
      content: post.content,
      type: post.type || "idea",
      timestamp: post.createdAt
        ? `${Math.floor(
            (Date.now() - post.createdAt.getTime()) / 3600000
          )} hours ago`
        : "just now",
      likesCount: post._count?.likes || 0,
      comments: post._count?.comments || 0,
      shares: post.sharesCount || 0,
      tags: post.topics.map((t) => t.topic.name),
      media: post.media,
      links: post.links,
      mentions: post.mentions.map((m) => ({
        id: m.user.id,
        name: m.user.displayName,
        username: m.user.username,
      })),
      isLiked: userId ? post.likes?.length > 0 : false,
    };

    return res.status(200).json({ post: transformedPost });
  } catch (err) {
    console.error("Post fetch error:", err);
    return res.status(err.statusCode || 500).json({
      error: err.message || "Something went wrong",
    });
  }
};

export { createPost, deletePost, getFeed, getSinglePost };
