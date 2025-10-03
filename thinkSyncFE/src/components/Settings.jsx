import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaLink, FaPalette, FaUser } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

import ProfileImages from "./EditProfile/ProfileImages";
import BasicInfoSection from "./EditProfile/BasicInfoSection";
import SocialLinksSection from "./EditProfile/SocialLinks";
import PreferencesSection from "./EditProfile/Preference";
import { useAuth } from "../contexts/AuthContext";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Initialize flat formData
  const [formData, setFormData] = useState({
    displayName: user.displayName || "",
    username: user.username || "",
    email: user.email || "",
    Mailnotification: user.details?.Mailnotification || false,
    MessageNotification: user.details?.MessageNotification || false,
    avatar: user.details?.avatar || "",
    bio: user.details?.bio || "",
    dateOfBirth: user.details?.dateOfBirth || "",
    github: user.details?.github || "",
    linkedin: user.details?.linkedin || "",
    location: user.details?.location || "",
    occupation: user.details?.occupation || "",
    role: user.details?.role || "",
    themePreference: user.details?.themePreference || "",
    twitter: user.details?.twitter || "",
    website: user.details?.website || "",
  });

  // Keep original values to calculate changes
  const initialData = useRef({ ...formData });

  const [activeSection, setActiveSection] = useState(
    new URLSearchParams(location.search).get("tab") || "basic"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const sections = [
    { id: "basic", label: "Basic Info", icon: FaUser },
    { id: "social", label: "Social Links", icon: FaLink },
    { id: "preferences", label: "Preferences", icon: FaPalette },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("tab", activeSection);
    navigate({ search: params.toString() }, { replace: true });
  }, [activeSection, navigate, location.search]);

  const handleImageUpload = (type) => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Image uploaded successfully!");
    }, 2000);
  };

  // Compute only changed fields
  const getChangedFields = () => {
    const changes = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== initialData.current[key]) {
        // Convert dateOfBirth string to Date object for Prisma
        if (key === "dateOfBirth" && formData[key]) {
          changes[key] = new Date(formData[key]);
        } else {
          changes[key] = formData[key];
        }
      }
    });
    return changes;
  };

  const handleSave = async () => {
    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      toast("No changes detected!");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.patch(
        "http://localhost:3000/user/update",
        changes,
        { withCredentials: true }
      );

      if (res.status === 200) {
        setUser(res.data.data);
        initialData.current = { ...formData };
        toast.success("Profile updated successfully!");
      } else {
        toast.error(`Failed to update profile! Internal Server Error`);
      }
    } catch (err) {
      toast.error(`Failed to update profile! ${err.response.data.error}`);
      console.log(err.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <BasicInfoSection userData={formData} setUserData={setFormData} />
        );
      case "social":
        return (
          <SocialLinksSection userData={formData} setUserData={setFormData} />
        );
      case "preferences":
        return (
          <PreferencesSection userData={formData} setUserData={setFormData} />
        );
      default:
        return (
          <BasicInfoSection userData={formData} setUserData={setFormData} />
        );
    }
  };

  return (
    <div className="w-full">
      <Toaster
        containerClassName="!text-green-300"
        toastOptions={{
          success: {
            style: {
              background: "green",
              color: "white",
            },
          },
          error: {
            style: {
              background: "red",
              color: "white",
            },
          },
        }}
      />
      <div className="container mx-auto py-2 px-0 sm:px-0 lg:px-0">
        <div className="flex justify-between items-center mb-8">
         
       
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/2">
            <div className="flex flex-col md:flex-row gap-12 mb-4">
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
            <button
            disabled={loading}
            onClick={handleSave}
            className="self-start mt-10 mb-10 bg-indigo-600 cursor-pointer text-white py-2 px-4 rounded hover:shadow-md transition-all duration-300"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
