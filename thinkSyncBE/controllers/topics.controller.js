import { prisma } from "../config/db.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { timeAgo } from "../utils/HelperFunction.js";
const fetchPostsByTopic = async (req, res) => {
  const { topicName } = req.params;
  const userId = req.user?.id || null;

  try {
    const posts = await prisma.post.findMany({
      where: {
        topics: { some: { topic: { name: topicName } } },
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
        topics: { include: { topic: { select: { id: true, name: true } } } },
        likes: userId ? { where: { userId } } : false,
        Bookmark: userId ? { where: { userId } } : false,
        _count: { select: { likes: true, comments: true } },
      },
    });

    const transformedPosts = posts.map((post) => ({
      id: post.id,
      author: {
        displayName: post.author?.displayName || post.author?.username,
        username: post.author?.username,
        avatar:
          post.author?.details?.avatar ||
          `https://placehold.co/40x40/667eea/ffffff?text=${
            post.author?.username?.[1] || "U"
          }`,
      },
      content: post.content,
      type: post.type || "idea",

      timestamp: timeAgo(post.createdAt),
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
      isBookmarked: userId ? post.Bookmark?.length > 0 : false,
    }));

    console.log("Transformed Posts:", transformedPosts);
    return res.status(200).json({ posts: transformedPosts });
  } catch (error) {
    console.error("Posts by topic fetch error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchTredingPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
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
        topics: { include: { topic: { select: { id: true, name: true } } } },
        likes: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json(new ApiResponce(500, "Internal Server Error"));
  }
};

const fetchTredingTopics = async (req, res) => {
  // try {
  //   const topics = await prisma.topic.findMany({
  //     orderBy: { _count: { posts: "desc" } },
  //     take: 10,
  //     include: { _count: { select: { posts: true } } },
  //   });
  //   return res.status(200).json({ topics });
  // } catch (error) {
  //   return res.status(500).json(new ApiResponce(500, "Internal Server Error"));
  // }

  return res.status(200).json({
    topics: [
      { id: 1, name: "JavaScript" },
      { id: 2, name: "WebDev" },
      { id: 3, name: "ReactJS" },
      { id: 4, name: "NodeJS" },
      { id: 5, name: "CSS" },
    ],
  });
};

export { fetchPostsByTopic, fetchTredingTopics, fetchTredingPosts };
