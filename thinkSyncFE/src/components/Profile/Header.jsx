import { FaCamera } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProfileHeader = ({ user, isOwnProfile, isFollowing, onFollow }) => (
  <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden mb-6 sm:mb-8 shadow-xl sm:shadow-2xl shadow-blue-500/5 dark:shadow-blue-400/5 relative">
    <div className="relative h-32 sm:h-48 md:h-56 overflow-hidden">
      <img
        src={user.details.coverImage || "https://via.placeholder.com/800x200"}
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
            src={user.details.avatar || "https://via.placeholder.com/150"}
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
          {user.details.bio && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              {user.details.bio}
            </p>
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

export default ProfileHeader;
