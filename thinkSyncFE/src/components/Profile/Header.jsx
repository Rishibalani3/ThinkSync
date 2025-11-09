import {
  FaCamera,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGlobe,
  FaBirthdayCake,
  FaUsers,
  FaUserFriends,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../../utils/axios";

const ProfileHeader = ({
  user,
  isOwnProfile,
  isFollowing,
  onFollow,
  followersCount = 0,
  followingCount = 0,
  onShowFollowers,
  onShowFollowing,
}) => {
  const [showModerationHistory, setShowModerationHistory] = useState(false);
  const [moderationData, setModerationData] = useState(null);

  const handleShowModeration = async () => {
    if (!showModerationHistory && !moderationData) {
      try {
        const res = await api.get("/user/moderation-history");
        setModerationData(res.data);
      } catch (err) {
        console.error("Failed to fetch moderation history:", err);
      }
    }
    setShowModerationHistory(!showModerationHistory);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden mb-6 sm:mb-8 shadow-xl sm:shadow-2xl shadow-blue-500/5 dark:shadow-blue-400/5 relative">
      <div className="relative h-32 sm:h-48 md:h-56 overflow-hidden">
        <img
          src={user.details.coverImage || "https://placehold.co/800x200"}
          alt="Cover"
          className="w-full h-full object-cover object-center"
        />
        {isOwnProfile && (
          <Link to="/settings?tab=cover">
            <button className="absolute cursor-pointer text-gray-800 px-7 dark:text-gray-200 top-4 right-4 bg-white dark:bg-gray-700 rounded-2xl p-2 hover:bg-white dark:hover:bg-gray-600 transition">
              Edit
            </button>
          </Link>
        )}
      </div>

      {/* Avatar & Info */}
      <div className="relative px-4 pb-4 sm:px-8 sm:pb-8 -mt-16 sm:-mt-20">
        <div className="pt-4 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
          {/* Avatar */}
          <div className="relative self-center sm:self-auto">
            <img
              src={`${
                import.meta.env.BACKEND_URL
              }/proxy?url=${encodeURIComponent(user.details.avatar)}`}
              alt="Profile"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-white dark:border-gray-800 shadow-xl sm:shadow-2xl transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 pt-2 sm:pt-4 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {user.displayName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium text-sm sm:text-base">
              @{user.username}
            </p>
            {user.details?.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                {user.details.bio}
              </p>
            )}

            {/* Public Info */}
            <div className="flex flex-wrap gap-4 mb-4 sm:mb-6 text-sm">
              {user.details?.occupation && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaBriefcase size={14} />
                  <span>{user.details.occupation}</span>
                </div>
              )}
              {user.details?.location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaMapMarkerAlt size={14} />
                  <span>{user.details.location}</span>
                </div>
              )}
              {user.details?.website && (
                <a
                  href={user.details.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <FaGlobe size={14} />
                  <span>Website</span>
                </a>
              )}
              {user.details?.dateOfBirth && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaBirthdayCake size={14} />
                  <span>
                    {new Date(user.details.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(user.details?.socialLinks?.github ||
              user.details?.socialLinks?.linkedin ||
              user.details?.socialLinks?.twitter) && (
              <div className="flex gap-3 mb-4 sm:mb-6">
                {user.details.socialLinks?.github && (
                  <a
                    href={user.details.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
                  >
                    <FaGithub size={20} />
                  </a>
                )}
                {user.details.socialLinks?.linkedin && (
                  <a
                    href={user.details.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
                  >
                    <FaLinkedin size={20} />
                  </a>
                )}
                {user.details.socialLinks?.twitter && (
                  <a
                    href={user.details.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition"
                  >
                    <FaTwitter size={20} />
                  </a>
                )}
              </div>
            )}

            {/* Followers/Following Count */}
            <div className="flex gap-6 mb-4 sm:mb-6">
              <button
                onClick={onShowFollowers}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
              >
                <FaUsers size={16} />
                <span className="font-semibold">{followersCount || 0}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Followers
                </span>
              </button>
              <button
                onClick={onShowFollowing}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
              >
                <FaUserFriends size={16} />
                <span className="font-semibold">{followingCount || 0}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Following
                </span>
              </button>
            </div>

            {/* Moderation Warning (Own Profile Only) */}
            {isOwnProfile && user.details?.warningCount > 0 && (
              <div className="mb-4 sm:mb-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Warning Count: {user.details.warningCount}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        Some of your content has been flagged for review(please
                        mail us if you think this is a mistake).
                      </p>
                    </div>
                    <button
                      onClick={handleShowModeration}
                      className="text-xs text-yellow-700 dark:text-yellow-300 hover:underline"
                    >
                      {showModerationHistory ? "Hide" : "View History"}
                    </button>
                  </div>
                  {showModerationHistory && moderationData && (
                    <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                      {moderationData.history?.length > 0 ? (
                        moderationData.history.map((item) => (
                          <div
                            key={item.id}
                            className="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-yellow-200 dark:border-yellow-800"
                          >
                            <p className="font-medium text-yellow-800 dark:text-yellow-200">
                              {item.type === "post" ? "Post" : "Comment"}{" "}
                              flagged
                            </p>
                            <p className="text-yellow-600 dark:text-yellow-400 mt-1">
                              {item.reason}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                              {item.timestamp}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          No moderation history available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Buttons for other user */}
            {!isOwnProfile && (
              <div className="flex gap-3 justify-center sm:justify-start">
                <button
                  onClick={onFollow}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    isFollowing
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      : "bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-400"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
