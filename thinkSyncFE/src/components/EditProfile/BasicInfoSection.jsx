import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaMapPin, FaLink } from "react-icons/fa";
import InputField from "./InputField";
import {
  MdOutlineAlternateEmail,
  MdOutlineCake,
  MdOutlineDescription,
  MdOutlineWorkOutline,
} from "react-icons/md";
import { BiEnvelope, BiPhone } from "react-icons/bi";

const BasicInfoSection = ({ profileData, onInputChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="flex items-center gap-3 mb-8">
      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white">
        <FaUser size={24} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Basic Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Update your personal details and profile information
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <InputField
        label="Display Name"
        icon={FaUser}
        value={profileData.displayName}
        onChange={(value) => onInputChange("displayName", value)}
        placeholder="Your full name"
      />

      <InputField
        label="Username"
        icon={MdOutlineAlternateEmail}
        value={profileData.username}
        onChange={(value) => onInputChange("username", value)}
        placeholder="@username"
      />

      <InputField
        label="Email Address"
        icon={BiEnvelope}
        type="email"
        value={profileData.email}
        onChange={(value) => onInputChange("email", value)}
        placeholder="your@email.com"
      />

      <InputField
        label="Phone Number"
        icon={BiPhone}
        type="tel"
        value={profileData.phone}
        onChange={(value) => onInputChange("phone", value)}
        placeholder="+1 (555) 123-4567"
      />

      <InputField
        label="Location"
        icon={FaMapPin}
        value={profileData.location}
        onChange={(value) => onInputChange("location", value)}
        placeholder="City, Country"
      />

      <InputField
        label="Website"
        icon={FaLink}
        type="url"
        value={profileData.website}
        onChange={(value) => onInputChange("website", value)}
        placeholder="https://yourwebsite.com"
      />

      <InputField
        label="Birthday"
        icon={MdOutlineCake}
        type="date"
        value={profileData.birthday}
        onChange={(value) => onInputChange("birthday", value)}
      />

      <InputField
        label="Occupation"
        icon={MdOutlineWorkOutline}
        value={profileData.occupation}
        onChange={(value) => onInputChange("occupation", value)}
        placeholder="Your job title"
      />
    </div>

    <InputField
      label="Bio"
      icon={MdOutlineDescription}
      type="textarea"
      rows={4}
      value={profileData.bio}
      onChange={(value) => onInputChange("bio", value)}
      placeholder="Tell us about yourself..."
      className="lg:col-span-2"
    />
  </motion.div>
);

export default BasicInfoSection;
