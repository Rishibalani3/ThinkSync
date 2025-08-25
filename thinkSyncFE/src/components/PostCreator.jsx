import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaLightbulb,
  FaQuestion,
  FaComment,
  FaPaperPlane,
  FaImage,
  FaLink,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const dummyUsers = ["alice", "bob", "charlie", "akshay"];
const dummyTopics = ["React", "NodeJS", "AI", "OpenSource"];

const PostCreator = ({ onNewPost }) => {
  const [content, setContent] = useState("");
  const [selectedType, setSelectedType] = useState("idea");
  const [isExpanded, setIsExpanded] = useState(false);
  const [image, setImage] = useState(null);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [trigger, setTrigger] = useState(null); // "@" or "#"

  const { user } = useAuth();

  const postTypes = [
    { id: "idea", label: "💡 Idea", icon: FaLightbulb },
    { id: "question", label: "❓ Question", icon: FaQuestion },
    { id: "thought", label: "💭 Thought", icon: FaComment },
  ];

  // Extract mentions & hashtags
  const parseContent = (text) => {
    const mentions = (text.match(/@\w+/g) || []).map((m) => m.slice(1));
    const hashtags = (text.match(/#\w+/g) || []).map((h) => h.slice(1));
    return { mentions, hashtags };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const { mentions, hashtags } = parseContent(content);

    const newPost = {
      content: content.trim(),
      type: selectedType,
      image,
      link,
      mentions,
      hashtags,
      userId: user.id,
    };

    try {
      setLoading(true);

      // Dummy API call
      const response = await axios.post(
        "https://jsonplaceholder.typicode.com/posts",
        newPost
      );

      console.log("Post saved:", response.data);

      onNewPost(newPost);

      // reset
      setContent("");
      setImage(null);
      setLink("");
      setIsExpanded(false);
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // preview
    }
  };

  const handleLinkAdd = () => {
    const url = prompt("Enter a link:");
    if (url) setLink(url);
  };

  const handleFocus = () => setIsExpanded(true);

  const handleChange = (e) => {
    const text = e.target.value;
    setContent(text);

    // detect last word
    const words = text.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      setTrigger("@");
      setSuggestions(
        dummyUsers.filter((u) =>
          u.toLowerCase().startsWith(lastWord.slice(1).toLowerCase())
        )
      );
    } else if (lastWord.startsWith("#")) {
      setTrigger("#");
      setSuggestions(
        dummyTopics.filter((t) =>
          t.toLowerCase().startsWith(lastWord.slice(1).toLowerCase())
        )
      );
    } else {
      setTrigger(null);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    const words = content.split(/\s+/);
    words[words.length - 1] = `${trigger}${suggestion}`;
    setContent(words.join(" "));
    setSuggestions([]);
    setTrigger(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <img
            src={
              user.details?.avatar ||
              `https://via.placeholder.com/150?text=${user.displayName?.[0]?.toUpperCase()}`
            }
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={handleChange}
              onFocus={handleFocus}
              placeholder="What's half-forming in your mind? Use @mention and #hashtag..."
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              rows={isExpanded ? 4 : 3}
            />

            {/* Suggestion dropdown */}
            {suggestions.length > 0 && (
              <ul className="absolute left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                {suggestions.map((s) => (
                  <li
                    key={s}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSelectSuggestion(s)}
                  >
                    {trigger === "@" ? `@${s}` : `#${s}`}
                  </li>
                ))}
              </ul>
            )}

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                {/* Post Type Selector */}
                <div className="flex gap-2">
                  {postTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedType === type.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {type.label}
                    </motion.button>
                  ))}
                </div>

                {/* Preview */}
                {(image || link) && (
                  <div className="border rounded-md p-2 text-sm text-gray-600 dark:text-gray-300">
                    {image && (
                      <img
                        src={image}
                        alt="preview"
                        className="w-32 h-32 object-cover rounded mb-2"
                      />
                    )}
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline break-all"
                      >
                        {link}
                      </a>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <label className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer">
                      <FaImage />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={handleLinkAdd}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      title="Add Link"
                    >
                      <FaLink />
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!content.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      "Posting..."
                    ) : (
                      <>
                        <FaPaperPlane className="text-sm" /> Share
                      </>
                    )}
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
