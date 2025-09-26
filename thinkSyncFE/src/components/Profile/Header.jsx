import { FaCamera } from "react-icons/fa";

const ProfileHeader = ({ user }) => (
  <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden mb-6 sm:mb-8 shadow-xl sm:shadow-2xl shadow-blue-500/5 dark:shadow-blue-400/5 relative">
    <div className="relative h-32 sm:h-48 md:h-56 overflow-hidden">
      <img
        src="https://media.licdn.com/dms/image/sync/v2/D4E27AQEo5TeLjgO3lQ/articleshare-shrink_800/articleshare-shrink_800/0/1711517383801?e=2147483647&v=beta&t=UYTn5T4fXCc9XqzYDmz2M3CCTWMzoYwdtFS9h2rm9WE"
        alt="Profile"
        className="w-full h-full object-cover object-center"
      />
    </div>

    <div className="relative px-4 pb-4 sm:px-8 sm:pb-8 -mt-16 sm:-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
        {/* Avatar */}
        <div className="relative self-center sm:self-auto">
          <img
            src={user.details.avatar}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-white dark:border-gray-800 shadow-xl sm:shadow-2xl transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Info */}
        <div className="flex-1 pt-2 sm:pt-4 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            {user.displayName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium text-sm sm:text-base">
            @{user.username}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
            {user.details.bio}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileHeader;
