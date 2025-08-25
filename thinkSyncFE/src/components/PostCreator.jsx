import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLightbulb,
  FaQuestion,
  FaComment,
  FaPaperPlane,
  FaImage,
  FaLink,
  FaTimes,
  FaAt,
  FaHashtag,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
const PostCreator = ({ onNewPost }) => {
  const [content, setContent] = useState("");
  const [selectedType, setSelectedType] = useState("idea");
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [links, setLinks] = useState([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [mentions, setMentions] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [showMentionInput, setShowMentionInput] = useState(false);
  const [showHashtagInput, setShowHashtagInput] = useState(false);
  const [mentionInput, setMentionInput] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const postTypes = [
    { id: "idea", label: "Idea", icon: FaLightbulb },
    { id: "question", label: "Question", icon: FaQuestion },
    { id: "thought", label: "Thought", icon: FaComment },
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              url: event.target.result,
              file: file,
              name: file.name,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (id) =>
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));

  const handleAddLink = () => {
    if (linkInput.trim()) {
      let url = linkInput.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }
      setLinks((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), url, title: url },
      ]);
      setLinkInput("");
      setShowLinkInput(false);
    }
  };

  const handleAddMention = () => {
    if (mentionInput.trim()) {
      setMentions((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), username: mentionInput.trim() },
      ]);
      setMentionInput("");
      setShowMentionInput(false);
    }
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim()) {
      setHashtags((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), tag: hashtagInput.trim() },
      ]);
      setHashtagInput("");
      setShowHashtagInput(false);
    }
  };

  const removeMention = (id) =>
    setMentions((prev) => prev.filter((mention) => mention.id !== id));

  const removeHashtag = (id) =>
    setHashtags((prev) => prev.filter((hashtag) => hashtag.id !== id));

  const removeLink = (id) =>
    setLinks((prev) => prev.filter((link) => link.id !== id));

  const handleSubmit = () => {
    if (onNewPost) {
      onNewPost({
        content,
        type: selectedType,
        images: uploadedImages,
        links,
        mentions,
        hashtags,
        timestamp: new Date().toISOString(),
      });
    }
    // Reset form
    setContent("");
    setUploadedImages([]);
    setLinks([]);
    setMentions([]);
    setHashtags([]);
    setIsExpanded(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md"
    >
      <div className="flex gap-3">
        <img
          src={
            user.details.avatar ||
            `https://via.placeholder.com/150?text=${user.displayName[0]}`
          }
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Share an idea, question, or thought..."
            className="w-full bg-transparent borde dark:text-white border-gray-300 dark:border-gray-600 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={isExpanded ? 4 : 2}
          />

          {/* Mentions Display */}
          {mentions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {mentions.map((mention) => (
                <div
                  key={mention.id}
                  className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  <FaAt className="mr-1" size={12} />
                  {mention.username}
                  <button
                    onClick={() => removeMention(mention.id)}
                    className="ml-2 text-blue-200 hover:text-white"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hashtags Display */}
          {hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {hashtags.map((hashtag) => (
                <div
                  key={hashtag.id}
                  className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  <FaHashtag className="mr-1" size={12} />
                  {hashtag.tag}
                  <button
                    onClick={() => removeHashtag(hashtag.id)}
                    className="ml-2 text-green-200 hover:text-white"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                {/* Image Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploadedImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-32 object-cover rounded-lg shadow"
                        />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Link Preview */}
                {links.length > 0 && (
                  <div className="space-y-2">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-blue-600 dark:text-blue-400 hover:underline flex-1"
                        >
                          {link.title}
                        </a>
                        <button
                          onClick={() => removeLink(link.id)}
                          className="ml-2 text-red-500 hover:text-red-600"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mention Input */}
                {showMentionInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mentionInput}
                      onChange={(e) => setMentionInput(e.target.value)}
                      placeholder="Enter username to mention..."
                      className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === "Enter" && handleAddMention()}
                    />
                    <button
                      onClick={handleAddMention}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Hashtag Input */}
                {showHashtagInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      placeholder="Enter hashtag..."
                      className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                      onKeyDown={(e) => e.key === "Enter" && handleAddHashtag()}
                    />
                    <button
                      onClick={handleAddHashtag}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Link Input */}
                {showLinkInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      placeholder="Paste URL..."
                      className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                    />
                    <button
                      onClick={handleAddLink}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Post Type Selector */}
                <div className="flex gap-2">
                  {postTypes.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition ${
                          selectedType === t.id
                            ? "bg-blue-600 text-white shadow"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        <Icon />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                      title="Add Image"
                    >
                      <FaImage />
                    </button>
                    <button
                      onClick={() => setShowLinkInput((p) => !p)}
                      className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                      title="Add Link"
                    >
                      <FaLink />
                    </button>
                    <button
                      onClick={() => setShowMentionInput((p) => !p)}
                      className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                      title="Mention Someone"
                    >
                      <FaAt />
                    </button>
                    <button
                      onClick={() => setShowHashtagInput((p) => !p)}
                      className="p-2 text-gray-500 hover:text-green-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                      title="Add Topic"
                    >
                      <FaHashtag />
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={
                      !content.trim() &&
                      uploadedImages.length === 0 &&
                      links.length === 0 &&
                      mentions.length === 0 &&
                      hashtags.length === 0
                    }
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                  >
                    <FaPaperPlane size={14} />
                    Share
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCreator;
