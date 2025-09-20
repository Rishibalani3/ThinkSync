import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaMapPin, FaLink } from "react-icons/fa";
import InputField from "./InputField";
import {
  MdOutlineAlternateEmail,
  MdOutlineCake,
  MdOutlineDescription,
  MdOutlineWorkOutline,
} from "react-icons/md";
import { BiEnvelope } from "react-icons/bi";

const BasicInfoSection = ({ userData, setUserData }) => {
  const dob = new Date(userData.dateOfBirth);
  const formattedDob = dob.toISOString().split("T")[0];

  return (
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
          value={userData.displayName ?? ""}
          onChange={(value) =>
            setUserData((prev) => ({
              ...prev,
              displayName: value,
            }))
          }
          placeholder="Your full name"
        />
        <InputField
          label="Username"
          icon={MdOutlineAlternateEmail}
          value={userData.username ?? ""}
          onChange={(value) =>
            setUserData((prev) => ({
              ...prev,
              username: value,
            }))
          }
          placeholder="@username"
        />

        <InputField
          label="Email Address"
          icon={BiEnvelope}
          type="email"
          value={userData.email ?? ""}
          onChange={(value) =>
            setUserData((prev) => ({
              ...prev,
              email: value,
            }))
          }
          placeholder="your@email.com"
        />

        <InputField
          label="Location"
          icon={FaMapPin}
          value={userData.location ?? ""}
          onChange={(value) =>
            setUserData((prev) => ({
              ...prev,
              location: value,
            }))
          }
          placeholder="City, Country"
        />

        <InputField
          label="Website"
          icon={FaLink}
          type="url"
          value={userData.website ?? ""}
          onChange={(value) =>
            setUserData((prev) => ({
              ...prev,
              website: value,
            }))
          }
          placeholder="https://yourwebsite.com"
        />
        <InputField
          label="Birthday"
          icon={MdOutlineCake}
          type="date"
          value={formattedDob}
          onChange={(value) =>
            setUserData((prev) => ({
              ...prev,
              dateOfBirth: value,
            }))
          }
        />

        <InputField
          label="Occupation"
          icon={MdOutlineWorkOutline}
          value={userData.occupation ?? ""}
          onChange={(value) =>
            setUserData((prev) => ({
              ...prev,
              occupation: value,
            }))
          }
          placeholder="Your job title"
        />
      </div>

      <InputField
        label="Bio"
        icon={MdOutlineDescription}
        type="textarea"
        rows={4}
        value={userData.bio ?? ""}
        onChange={(value) =>
          setUserData((prev) => ({
            ...prev,
            bio: value,
          }))
        }
        placeholder="Tell us about yourself..."
        className="lg:col-span-2"
      />
    </motion.div>
  );
};

export default BasicInfoSection;
