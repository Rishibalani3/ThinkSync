import { motion } from "framer-motion";
import { FaCamera, FaImage } from "react-icons/fa";

const ProfilePhotoSection = ({ userData, setUserData }) => {
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserData((prev) => ({
        ...prev,
        [type]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
     

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-gray-300">
            {userData.profilePhoto ? (
              <img
                src={userData.profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                <FaCamera size={32} />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "profilePhoto")}
            className="text-sm text-gray-600"
          />
        </div>

        {/* Cover Photo */}
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <div className="w-full h-40 rounded-lg overflow-hidden mb-4 border-2 border-gray-300">
            {userData.coverPhoto ? (
              <img
                src={userData.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                <FaImage size={32} />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "coverPhoto")}
            className="text-sm text-gray-600"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePhotoSection;
