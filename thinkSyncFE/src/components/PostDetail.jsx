import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/axios";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaEllipsisH,
  FaReply,
  FaClock,
} from "react-icons/fa";
import useLike from "../hooks/useLike";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toggleLike } = useLike();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${id}`);
        setPost(response.data.post);
        setIsLiked(!!response.data.post?.isLiked);
        setIsBookmarked(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      console.log("Comment submitted:", comment);
      setComment("");
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "idea":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
      case "question":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
      case "thought":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      default:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-700 dark:text-gray-200">
        Loading post...
      </div>
    );

  if (error)
    return <div className="text-center mt-20 text-red-500">{error}</div>;

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <FaArrowLeft />
          Back to Feed
        </Link>

        {/* Main Post */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {post.author.name}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {post.author.username}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <FaClock className="text-sm text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {post.timestamp}
                  </span>
                  <span
                    className={`px-6 py-0.1 flex rounded-xl text-xs font-medium ${getTypeColor(
                      post.type
                    )}`}
                  >
                    {post.type}
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <FaEllipsisH />
            </motion.button>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
              {post.content}
            </p>
          </div>

          {/* Media */}
          {post.media?.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
              {post.media.length === 1 ? (
                <div className="relative">
                  {post.media[0].type === "image" ? (
                    <img
                      src={post.media[0].url}
                      alt="media"
                      className="w-full max-h-[500px] object-cover"
                    />
                  ) : (
                    <video
                      src={post.media[0].url}
                      controls
                      className="w-full max-h-[500px]"
                    />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-0.5">
                  {post.media.map((m, idx) => (
                    <div key={idx} className="relative">
                      {m.type === "image" ? (
                        <img
                          src={m.url}
                          alt="media"
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <video
                          src={m.url}
                          controls
                          className="w-full h-64 object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={async () => {
                  const prev = isLiked;
                  const delta = prev ? -1 : 1;
                  setIsLiked(!prev);
                  setPost((p) => ({
                    ...p,
                    likesCount: (p?.likesCount || 0) + delta,
                  }));
                  const result = await toggleLike(id);
                  if (result?.error) {
                    setIsLiked(prev);
                    setPost((p) => ({
                      ...p,
                      likesCount: (p?.likesCount || 0) - delta,
                    }));
                  }
                }}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  isLiked
                    ? "text-red-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                }`}
              >
                <FaHeart className={isLiked ? "fill-current" : ""} />
                {post?.likesCount || 0}
              </motion.button>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FaComment />
                {post.comments}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
              >
                <FaShare />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked
                  ? "text-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <FaBookmark className={isBookmarked ? "fill-current" : ""} />
            </motion.button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Comments ({post.comments})
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <img
                src="https://placehold.co/40x40/667eea/ffffff?text=JD"
                alt="Your Avatar"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!comment.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    <FaReply />
                    Reply
                  </motion.button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
        </div>
      </motion.div>
    </div>
  );
};

export default PostDetail;
