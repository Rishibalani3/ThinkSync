import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaLightbulb, 
  FaQuestion, 
  FaComment, 
  FaPaperPlane,
  FaImage,
  FaLink,
  FaSmile
} from 'react-icons/fa';

const PostCreator = ({ onNewPost }) => {
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState('idea');
  const [isExpanded, setIsExpanded] = useState(false);

  const postTypes = [
    { id: 'idea', label: '💡 Idea', icon: FaLightbulb },
    { id: 'question', label: '❓ Question', icon: FaQuestion },
    { id: 'thought', label: '💭 Thought', icon: FaComment }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onNewPost({
        content: content.trim(),
        type: selectedType
      });
      setContent('');
      setIsExpanded(false);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <img
            src="https://placehold.co/40x40/667eea/ffffff?text=JD"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleFocus}
              placeholder="What's half-forming in your mind? Share an idea, question, or thought..."
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              rows={isExpanded ? 4 : 3}
            />
            
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                {/* Post Type Selector */}
                <div className="flex gap-2">
                  {postTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <motion.button
                        key={type.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedType === type.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type.label}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      title="Add Image"
                    >
                      <FaImage />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      title="Add Link"
                    >
                      <FaLink />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      title="Add Emoji"
                    >
                      <FaSmile />
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!content.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    <FaPaperPlane className="text-sm" />
                    Share
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default PostCreator; 