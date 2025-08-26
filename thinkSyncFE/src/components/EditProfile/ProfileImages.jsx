import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaCamera } from "react-icons/fa";
import { HiOutlinePhotograph } from "react-icons/hi";
import { useAuth } from "../../contexts/AuthContext";

const ProfileImages = ({ profileData, onImageUpload, isUploading }) => {
  const fileInputRef = useRef(null);
  const handleFileSelect = (type) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      fileInputRef.current.dataset.type = type; // store cover/avatar
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onImageUpload(fileInputRef.current.dataset.type, files[0]);
    }
  };

  return (
    <div className="relative mb-8">
      {/* Hidden input */}
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
          src={profileData.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleFileSelect("cover")}
          className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          {isUploading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <HiOutlinePhotograph size={20} />
            </motion.div>
          ) : (
            <FaCamera size={20} />
          )}
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
            src={profileData.avatar}
            alt="Profile"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-white dark:border-gray-900 shadow-2xl"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-2 right-2 p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
            onClick={() => handleFileSelect("avatar")}
          >
            <FaCamera size={16} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    coverImage:
      "https://media.licdn.com/dms/image/sync/v2/D4E27AQEo5TeLjgO3lQ/articleshare-shrink_800/articleshare-shrink_800/0/1711517383801?e=2147483647&v=beta&t=UYTn5T4fXCc9XqzYDmz2M3CCTWMzoYwdtFS9h2rm9WE",
    avatar: user.details.avatar,
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (type, file) => {
    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData((prev) => ({
        ...prev,
        [type === "cover" ? "coverImage" : "avatar"]: reader.result, // update preview instantly
      }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <ProfileImages
        profileData={profileData}
        onImageUpload={handleImageUpload}
        isUploading={isUploading}
      />
    </div>
  );
};

export default ProfilePage;
