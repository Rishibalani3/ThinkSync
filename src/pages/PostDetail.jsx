import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft,
  FaHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaEllipsisH,
  FaReply,
  FaLightbulb,
  FaQuestion,
  FaComment as FaThought,
  FaUser,
  FaClock
} from 'react-icons/fa';

const PostDetail = () => {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock post data
  const post = {
    id: id,
    author: {
      name: 'Sarah Chen',
      avatar: 'https://placehold.co/40x40/667eea/ffffff?text=SC',
      username: '@sarahchen'
    },
    content: 'Just had a breakthrough idea about combining AI with sustainable energy systems. What if we could use machine learning to optimize solar panel efficiency in real-time based on weather patterns? This could revolutionize how we approach renewable energy and make solar power much more efficient and cost-effective. 🌱⚡',
    type: 'idea',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    shares: 3,
    tags: ['AI', 'Sustainability', 'Energy', 'Innovation']
  };

  const comments = [
    {
      id: 1,
      author: {
        name: 'Marcus Rodriguez',
        avatar: 'https://placehold.co/40x40/667eea/ffffff?text=MR',
        username: '@marcusrod'
      },
      content: 'This is fascinating! Have you considered the computational requirements for real-time optimization?',
      timestamp: '1 hour ago',
      likes: 5
    },
    {
      id: 2,
      author: {
        name: 'Emma Thompson',
        avatar: 'https://placehold.co/40x40/667eea/ffffff?text=ET',
        username: '@emmathompson'
      },
      content: 'Great idea! This could also help with energy storage optimization. What about integrating with battery systems?',
      timestamp: '45 minutes ago',
      likes: 3
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'idea':
        return <FaLightbulb className="text-yellow-500" />;
      case 'question':
        return <FaQuestion className="text-blue-500" />;
      case 'thought':
        return <FaThought className="text-green-500" />;
      default:
        return <FaLightbulb className="text-yellow-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'idea':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'question':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'thought':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      // Handle comment submission
      console.log('Comment submitted:', comment);
      setComment('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-4xl mx-auto p-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
          >
            <FaArrowLeft />
            Back to Feed
          </Link>

          {/* Main Post */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            {/* Post Header */}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(post.type)}`}>
                      {getTypeIcon(post.type)} {post.type}
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
            <div className="mb-6">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                {post.content}
              </p>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
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
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    isLiked
                      ? 'text-red-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                  }`}
                >
                  <FaHeart className={isLiked ? 'fill-current' : ''} />
                  {isLiked ? post.likes + 1 : post.likes}
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
                  {post.shares}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked
                    ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FaBookmark className={isBookmarked ? 'fill-current' : ''} />
              </motion.button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Comments ({comments.length})
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
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {comment.author.name}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {comment.author.username}
                      </span>
                      <span className="text-sm text-gray-400">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <FaHeart />
                        {comment.likes}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      >
                        Reply
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetail;
