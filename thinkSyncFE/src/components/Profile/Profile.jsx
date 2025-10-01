import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ProfileHeader from "./Header";
import Tabs from "./ProfileTabs";
import PostCard from "./PostCard";
import api from "../../utils/axios";
import { FiMessageCircle } from "react-icons/fi";
import { FaLightbulb } from "react-icons/fa";
import { BiHelpCircle } from "react-icons/bi";
import { GiSparkles } from "react-icons/gi";
import NotFound from "../UtilComponents/NotFound";
import useLike from "../../hooks/useLike";
import TopSpacer from "../UtilComponents/TopSpacer";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [PostTypes, setPostTypes] = useState([]);
  const { toggleLike } = useLike();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const isOwn = !username;
        let profileUser = currentUser;
        let posts = [];
        let isFollowing = false;

        if (!isOwn) {
          const res = await api.get(`/user/profile/${username}`);
          profileUser = res.data.profileUser;
          posts = res.data.posts || [];
          isFollowing = res.data.isFollowing;
        } else {
          const postsRes = await api.get(`/user/${currentUser.id}/posts`);
          posts = postsRes.data || [];
        }

        const ideas = posts.filter((p) => p.type === "idea");
        const questions = posts.filter((p) => p.type === "question");
        const thoughts = posts.filter((p) => p.type === "thought");

        setPostTypes({
          ideas,
          questions,
          thoughts,
        });

        setProfileData({
          profileUser,
          posts,
          isOwnProfile: isOwn,
          isFollowing,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser]);

  if (loading) return <p className="text-center mt-20">Loading profile...</p>;
  if (!profileData) return <NotFound message="User not found 💀" />;

  const { profileUser, posts, isOwnProfile, isFollowing } = profileData;

  const handleFollow = async () => {
    try {
      await api.post(`/follower/follow/${profileUser.id}`, {});
      setProfileData((prev) => ({
        ...prev,
        isFollowing: !prev.isFollowing,
      }));
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const tabs = [
    { id: "posts", label: "Posts", count: posts.length, icon: FiMessageCircle },
    {
      id: "ideas",
      label: "Ideas",
      count: posts.filter((p) => p.type === "idea").length,
      icon: FaLightbulb,
    },
    {
      id: "questions",
      label: "Questions",
      count: posts.filter((p) => p.type === "question").length,
      icon: BiHelpCircle,
    },
    {
      id: "thoughts",
      label: "Thoughts",
      count: posts.filter((p) => p.type === "thought").length,
      icon: GiSparkles,
    },
  ];
  const handleLike = async (postId) => {
    setProfileData((prev) => {
      const updatedPosts = prev.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likesCount: (post.likesCount || 0) + (post.isLiked ? -1 : 1),
              isLiked: !post.isLiked,
            }
          : post
      );

      const ideas = updatedPosts.filter((p) => p.type === "idea");
      const questions = updatedPosts.filter((p) => p.type === "question");
      const thoughts = updatedPosts.filter((p) => p.type === "thought");

      setPostTypes({ ideas, questions, thoughts });
      return { ...prev, posts: updatedPosts };
    });

    const result = await toggleLike(postId);
    if (result?.error) {
      setProfileData((prev) => {
        const updatedPosts = prev.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: (post.likesCount || 0) + (post.isLiked ? -1 : 1),
                isLiked: !post.isLiked,
              }
            : post
        );

        const ideas = updatedPosts.filter((p) => p.type === "idea");
        const questions = updatedPosts.filter((p) => p.type === "question");
        const thoughts = updatedPosts.filter((p) => p.type === "thought");

        setPostTypes({ ideas, questions, thoughts });
        return { ...prev, posts: updatedPosts };
      });
    }
  };

  const renderPosts = (list) =>
    list.length > 0 ? (
      list.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => handleLike(post.id)}
        />
      ))
    ) : (
      <p className="text-center text-gray-500">No posts yet.</p>
    );
  return (
    <TopSpacer>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto p-3 sm:p-5">
          {/* Profile Header */}
          <ProfileHeader
            user={profileUser}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            onFollow={handleFollow}
          />

          {/* Tabs */}
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl sm:shadow-2xl shadow-blue-500/5 dark:shadow-blue-400/5 overflow-x-auto mb-6">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* Posts */}
          <div className="p-4 sm:p-6 md:p-2 min-h-[50vh]">
            {loading ? (
              <p className="text-center text-gray-500">Loading posts...</p>
            ) : (
              <>
                {activeTab === "posts" && (
                  <div className="space-y-4 sm:space-y-6">
                    {renderPosts(posts)}
                  </div>
                )}
                {activeTab === "ideas" && (
                  <div className="space-y-4 sm:space-y-6">
                    {renderPosts(PostTypes.ideas)}
                  </div>
                )}
                {activeTab === "questions" && (
                  <div className="space-y-4 sm:space-y-6">
                    {renderPosts(PostTypes.questions)}
                  </div>
                )}
                {activeTab === "thoughts" && (
                  <div className="space-y-4 sm:space-y-6">
                    {renderPosts(PostTypes.thoughts)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </TopSpacer>
  );
};

export default Profile;
