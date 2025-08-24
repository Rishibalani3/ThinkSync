import { motion } from "framer-motion";
import {
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaLink,
} from "react-icons/fa";
import InputField from "./InputField";

const SocialLinksSection = ({ profileData, onInputChange }) => {
  const socialPlatforms = [
    {
      key: "twitter",
      label: "Twitter",
      icon: FaTwitter,
      color: "text-blue-400",
      placeholder: "https://twitter.com/username",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: FaLinkedin,
      color: "text-blue-600",
      placeholder: "https://linkedin.com/in/username",
    },
    {
      key: "github",
      label: "GitHub",
      icon: FaGithub,
      color: "text-gray-800 dark:text-gray-200",
      placeholder: "https://github.com/username",
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: FaInstagram,
      color: "text-pink-500",
      placeholder: "https://instagram.com/username",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white">
          <FaLink size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Social Links
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your social media profiles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {socialPlatforms.map((social, index) => (
          <motion.div
            key={social.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <InputField
              label={social.label}
              icon={social.icon}
              type="url"
              value={profileData.social[social.key] || ""}
              onChange={(value) => onInputChange(social.key, value, "social")}
              placeholder={social.placeholder}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SocialLinksSection;
