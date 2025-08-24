import React from "react";
import { motion } from "framer-motion";
import { FaCamera } from "react-icons/fa";
import { HiOutlinePhotograph } from "react-icons/hi";

const ProfileImages = ({ profileData, onImageUpload, isUploading }) => (
  <div className="relative mb-8">
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
        onClick={() => onImageUpload("cover")}
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

    {/* Profile Avatar */}
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
          onClick={() => onImageUpload("avatar")}
          className="absolute bottom-2 right-2 p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <FaCamera size={16} />
        </motion.button>
      </motion.div>
    </div>
  </div>
);

export default ProfileImages;
