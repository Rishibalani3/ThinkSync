import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaLink, FaPalette, FaShieldAlt, FaUser } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom"; // 👈 important

import ProfileImages from "./EditProfile/ProfileImages";
import BasicInfoSection from "./EditProfile/BasicInfoSection";
import SocialLinksSection from "./EditProfile/SocialLinks";
import PreferencesSection from "./EditProfile/Preference";
import PrivacySection from "./EditProfile/Privacy";
import { useAuth } from "../contexts/AuthContext";

const EditProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // read query param on mount
  const queryParams = new URLSearchParams(location.search);
  const { user } = useAuth();
  const initialTab = queryParams.get("tab") || "basic";

  const [activeSection, setActiveSection] = useState(initialTab);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: "Alexandra Johnson",
    username: "alexj",
    email: "alexandra.johnson@example.com",
    bio: "Product designer passionate about creating delightful user experiences. Coffee enthusiast and weekend photographer.",
    location: "San Francisco, CA",
    website: "alexandraj.design",
    phone: "+1 (555) 123-4567",
    birthday: "1992-08-15",
    occupation: "Senior Product Designer",
    education: "Stanford Design Program",
    avatar: user.details.avatar,
    coverImage:
      "https://media.licdn.com/dms/image/sync/v2/D4E27AQEo5TeLjgO3lQ/articleshare-shrink_800/articleshare-shrink_800/0/1711517383801?e=2147483647&v=beta&t=UYTn5T4fXCc9XqzYDmz2M3CCTWMzoYwdtFS9h2rm9WE",

    social: {
      twitter: "https://twitter.com/alexjdesign",
      linkedin: "https://linkedin.com/in/alexandraj",
      github: "https://github.com/alexj",
      instagram: "https://instagram.com/alexj_design",
    },
    preferences: {
      theme: "system",
      notifications: {
        email: true,
        push: true,
        marketing: false,
      },
      privacy: {
        profileVisibility: "public",
        showEmail: false,
        showPhone: false,
      },
    },
  });

  const sections = [
    { id: "basic", label: "Basic Info", icon: FaUser },
    { id: "social", label: "Social Links", icon: FaLink },
    { id: "preferences", label: "Preferences", icon: FaPalette },
    { id: "privacy", label: "Privacy", icon: FaShieldAlt },
  ];

  // keep URL in sync with active tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("tab", activeSection);
    navigate({ search: params.toString() }, { replace: true });
  }, [activeSection, navigate, location.search]);

  const handleInputChange = (field, value, nested = null) => {
    setUnsavedChanges(true);
    setProfileData((prev) => {
      if (nested) {
        const nestedKeys = nested.split(".");
        if (nestedKeys.length === 2) {
          return {
            ...prev,
            [nestedKeys[0]]: {
              ...prev[nestedKeys[0]],
              [nestedKeys[1]]: {
                ...prev[nestedKeys[0]][nestedKeys[1]],
                [field]: value,
              },
            },
          };
        } else {
          return {
            ...prev,
            [nested]: {
              ...prev[nested],
              [field]: value,
            },
          };
        }
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleImageUpload = (type) => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUnsavedChanges(true);
    }, 2000);
  };

  const handleSave = () => {
    setShowSuccessMessage(true);
    setUnsavedChanges(false);
    setTimeout(() => setShowSuccessMessage(false), 4000);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <BasicInfoSection
            profileData={profileData}
            onInputChange={handleInputChange}
          />
        );
      case "social":
        return (
          <SocialLinksSection
            profileData={profileData}
            onInputChange={handleInputChange}
          />
        );
      case "preferences":
        return (
          <PreferencesSection
            profileData={profileData}
            onInputChange={handleInputChange}
          />
        );
      case "privacy":
        return (
          <PrivacySection
            profileData={profileData}
            onInputChange={handleInputChange}
          />
        );
      default:
        return (
          <BasicInfoSection
            profileData={profileData}
            onInputChange={handleInputChange}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 pt-20">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Edit Profile
          </h1>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-full hover:shadow-md transition-all duration-300"
          >
            Save Changes
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 md:mr-8">
            <ProfileImages
              profileData={profileData}
              onImageUpload={handleImageUpload}
              isUploading={isUploading}
            />
          </div>

          <div className="md:w-2/3">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-gray-300 dark:text-white dark:hover:bg-black transition-all duration-300 ${
                    activeSection === section.id
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }`}
                >
                  <section.icon size={20} />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>

            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
