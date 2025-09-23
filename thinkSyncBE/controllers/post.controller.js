import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const createPost = async (req, res) => {
  try {
    const { content, type } = req.body;

    console.log("req.body:", req.body);
    if (!content || !type) {
      return res.status(400).json(new ApiError(400, "Missing fields"));
    }

    const links = req.body.links ? JSON.parse(req.body.links) : [];
    const mentions = req.body.mentions ? JSON.parse(req.body.mentions) : [];
    const hashtags = req.body.hashtags ? JSON.parse(req.body.hashtags) : [];

    let mediaData = [];
    if (req.files) {
      for (const file of req.files.image) {
        const url = await uploadOnCloudinary(file.path);
        if (url) {
          mediaData.push({
            url,
            type: "image",
          });
        }
      }
    }

    const post = await prisma.post.create({
      data: {
        content,
        type,
        authorId: req.user.id,
        media: { create: mediaData },
        links: {
          create: links.map((link) => ({
            url: link.url,
          })),
        },
      },
      include: {
        media: true,
        links: true,
      },
    });

    if (mentions.length > 0) {
      for (const mention of mentions) {
        const user = await prisma.user.findUnique({
          where: { username: mention.username },
        });
        if (user) {
          await prisma.mention.create({
            data: {
              postId: post.id,
              userId: user.id,
            },
          });
        }
      }
    }

    // 3: attach topics (resolve tags to topicId)
    if (hashtags.length > 0) {
      for (const hashtag of hashtags) {
        const topic = await prisma.topic.upsert({
          where: { name: hashtag.tag },
          create: { name: hashtag.tag },
          update: {},
        });
        await prisma.postTopic.create({
          data: {
            postId: post.id,
            topicId: topic.id,
          },
        });
      }
    }

    // 4: fetch post with all relations
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
    const userId = req.user?.id || null; // current user ID (null for guests)
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
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: true,
        links: true,
        mentions: { include: { user: true } },
        topics: { include: { topic: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json({ post });
  } catch (err) {
    console.error("Post fetch error:", err);
    return res
      .status(err.statusCode || 500)
      .json(
        err instanceof ApiError
          ? err
          : new ApiError(500, "Something went wrong: " + err.message)
      );
  }
};

export { createPost, deletePost, getFeed, getSinglePost };
