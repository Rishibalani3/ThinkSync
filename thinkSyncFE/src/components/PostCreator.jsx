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
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PostCreator = ({ onNewPost }) => {
  const [state, setState] = useState({
    content: "",
    selectedType: "idea",
    isExpanded: false,
    uploadedImages: [],
    links: [],
    mentions: [],
    hashtags: [],
    showLinkInput: false,
    linkInput: "",
    showMentionInput: false,
    mentionInput: "",
    showHashtagInput: false,
    hashtagInput: "",
  });

  const fileInputRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const updateState = (updates) =>
    setState((prev) => ({ ...prev, ...updates }));

  const postTypes = [
    { id: "idea", label: "Idea", icon: FaLightbulb },
    { id: "question", label: "Question", icon: FaQuestion },
    { id: "thought", label: "Thought", icon: FaComment },
  ];

  const handleImageUpload = (e) => {
    if (!isAuthenticated) {
      alert("Please log in to upload images.");
      navigate("/login");
      return;
    }

    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          updateState({
            uploadedImages: [
              ...state.uploadedImages,
              {
                id: Date.now() + Math.random(),
                url: event.target.result,
                file,
                name: file.name,
              },
            ],
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (id) =>
    updateState({
      uploadedImages: state.uploadedImages.filter((img) => img.id !== id),
    });

  const handleAddLink = () => {
    if (state.linkInput.trim()) {
      let url = state.linkInput.trim();
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      updateState({
        links: [
          ...state.links,
          { id: Date.now() + Math.random(), url, title: url },
        ],
        linkInput: "",
        showLinkInput: false,
      });
    }
  };

  const handleAddMention = () => {
    if (state.mentionInput.trim()) {
      updateState({
        mentions: [
          ...state.mentions,
          {
            username: state.mentionInput.trim(),
          },
        ],
        mentionInput: "",
        showMentionInput: false,
      });
    }
  };

  const handleAddHashtag = () => {
    if (state.hashtagInput.trim()) {
      updateState({
        hashtags: [...state.hashtags, { tag: state.hashtagInput.trim() }],
        hashtagInput: "",
        showHashtagInput: false,
      });
    }
  };

  const removeMention = (id) =>
    updateState({
      mentions: state.mentions.filter((m) => m.id !== id),
    });

  const removeHashtag = (id) =>
    updateState({
      hashtags: state.hashtags.filter((h) => h.id !== id),
    });

  const removeLink = (id) =>
    updateState({
      links: state.links.filter((l) => l.id !== id),
    });

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert("Please log in to create a post.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("content", state.content);
      formData.append("type", state.selectedType);

      // Append images
      state.uploadedImages.forEach((img, index) => {
        formData.append("image", img.file);
      });

      // Append links, mentions, hashtags as JSON
      formData.append("links", JSON.stringify(state.links));
      formData.append("mentions", JSON.stringify(state.mentions));
      formData.append("hashtags", JSON.stringify(state.hashtags));

      const res = await axios.post(
        "http://localhost:3000/posts/create",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Post created:", res.data);

      // Reset state
      updateState({
        content: "",
        uploadedImages: [],
        links: [],
        mentions: [],
        hashtags: [],
        isExpanded: false,
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
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
            user?.details?.avatar ||
            `https://via.placeholder.com/150?text=${
              user?.displayName?.[0] || "U"
            }`
          }
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />

        <div className="flex-1">
          <textarea
            value={state.content}
            onChange={(e) => updateState({ content: e.target.value })}
            onFocus={() => updateState({ isExpanded: true })}
            placeholder={
              isAuthenticated
                ? "Share an idea, question, or thought..."
                : "Log in to post..."
            }
            className="w-full dark:text-white border border-black dark:border-white rounded-lg p-3 resize-none focus:outline-none"
            rows={state.isExpanded ? 4 : 2}
            disabled={!isAuthenticated}
          />

          {/* Mentions Display */}
          {state.mentions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {state.mentions.map((mention) => (
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
          {state.hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {state.hashtags.map((hashtag) => (
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
            {state.isExpanded && isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                {/* Image Preview */}
                {state.uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {state.uploadedImages.map((img) => (
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
                {state.links.length > 0 && (
                  <div className="space-y-2">
                    {state.links.map((link) => (
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
                {state.showMentionInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={state.mentionInput}
                      onChange={(e) =>
                        updateState({ mentionInput: e.target.value })
                      }
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
                {state.showHashtagInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={state.hashtagInput}
                      onChange={(e) =>
                        updateState({ hashtagInput: e.target.value })
                      }
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

                {state.showLinkInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={state.linkInput}
                      onChange={(e) =>
                        updateState({ linkInput: e.target.value })
                      }
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
                        onClick={() => updateState({ selectedType: t.id })}
                        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition ${
                          state.selectedType === t.id
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
                      onClick={() =>
                        updateState({ showLinkInput: !state.showLinkInput })
                      }
                      className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                      title="Add Link"
                    >
                      <FaLink />
                    </button>
                    <button
                      onClick={() =>
                        updateState({
                          showMentionInput: !state.showMentionInput,
                        })
                      }
                      className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                      title="Mention Someone"
                    >
                      <FaAt />
                    </button>
                    <button
                      onClick={() =>
                        updateState({
                          showHashtagInput: !state.showHashtagInput,
                        })
                      }
                      className="p-2 text-gray-500 hover:text-green-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                      title="Add Topic"
                    >
                      <FaHashtag />
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={
                      !state.content.trim() &&
                      state.uploadedImages.length === 0 &&
                      state.links.length === 0 &&
                      state.mentions.length === 0 &&
                      state.hashtags.length === 0
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
