import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FaCamera } from "react-icons/fa";

const ProfileImages = ({ userData, onUpload, isUploading }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (type) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      fileInputRef.current.dataset.type = type;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(fileInputRef.current.dataset.type, file);
    }
  };

  return (
    <div className="relative mb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white">
          <FaCamera size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Profile & Cover Photos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Update your profile picture and cover photo
          </p>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Cover Image */}
      <motion.div
        className="relative h-40 sm:h-56 rounded-3xl overflow-hidden mb-8 group"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={userData.coverImage || "https://placehold.co/800x200"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleFileSelect("coverImage")}
          className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          {isUploading ? "Uploading..." : <FaCamera size={20} />}
        </motion.button>
      </motion.div>

      {/* Avatar */}
      <div className="flex justify-center -mt-20 mb-6">
        <motion.div
          className="relative group"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={
              `${
                import.meta.env.VITE_BACKEND_URL
              }/proxy?url=${encodeURIComponent(userData.avatar)}` ||
              "/default-avatar.jpg"
            }
            alt="Profile"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-white dark:border-gray-900 shadow-2xl"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-2 right-2 p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
            onClick={() => handleFileSelect("avatar")}
          >
            {isUploading ? "Uploading..." : <FaCamera size={16} />}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileImages;
