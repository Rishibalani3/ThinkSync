import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ProfileHeader from "./Header";
import Tabs from "./ProfileTabs";
import PostCard from "./PostCard";
import api from "../../utils/axios";
import NotFound from "../UtilComponents/NotFound";
import useLike from "../../hooks/useLike";
import useBookmark from "../../hooks/useBookmark";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [postTypes, setPostTypes] = useState({
    ideas: [],
    questions: [],
    thoughts: [],
  });

  const { toggleLike } = useLike();
  const { toggleBookmark } = useBookmark();

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

        setPostTypes({ ideas, questions, thoughts });

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
      await api.post(`/follower/follow/${profileUser.id}`);
      setProfileData((prev) => ({
        ...prev,
        isFollowing: !prev.isFollowing,
      }));
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const tabs = [
    { id: "posts", label: "Posts", count: posts.length },
    { id: "ideas", label: "Ideas", count: postTypes.ideas.length },
    { id: "questions", label: "Questions", count: postTypes.questions.length },
    { id: "thoughts", label: "Thoughts", count: postTypes.thoughts.length },
  ];

  const updatePostTypes = (updatedPosts) => {
    setPostTypes({
      ideas: updatedPosts.filter((p) => p.type === "idea"),
      questions: updatedPosts.filter((p) => p.type === "question"),
      thoughts: updatedPosts.filter((p) => p.type === "thought"),
    });
  };

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
      updatePostTypes(updatedPosts);
      return { ...prev, posts: updatedPosts };
    });

    const result = await toggleLike(postId);
    if (result?.error) {
      setProfileData((prev) => {
        const reverted = prev.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: (post.likesCount || 0) + (post.isLiked ? -1 : 1),
                isLiked: !post.isLiked,
              }
            : post
        );
        updatePostTypes(reverted);
        return { ...prev, posts: reverted };
      });
    }
  };

  const handleBookmark = async (postId) => {
    setProfileData((prev) => {
      const updatedPosts = prev.posts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      );
      updatePostTypes(updatedPosts);
      return { ...prev, posts: updatedPosts };
    });

    await toggleBookmark(postId);
  };

  const renderPosts = (list) =>
    list.length > 0 ? (
      list.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => handleLike(post.id)}
          onBookmark={() => handleBookmark(post.id)}
        />
      ))
    ) : (
      <p className="text-center text-gray-500">No posts yet.</p>
    );

  return (
    <div className="w-full">
      <div className="p-3 sm:p-5">
        <ProfileHeader
          user={profileUser}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={handleFollow}
        />

        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl sm:shadow-2xl shadow-blue-500/5 dark:shadow-blue-400/5 overflow-x-auto mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="p-4 sm:p-6 md:p-2 min-h-[50vh] ">
          {loading ? (
            <p className="text-center text-gray-500">Loading posts...</p>
          ) : (
            <>
              <div className="gap-6 flex flex-col">
                {activeTab === "posts" && renderPosts(posts)}
                {activeTab === "ideas" && renderPosts(postTypes.ideas)}
                {activeTab === "questions" && renderPosts(postTypes.questions)}
                {activeTab === "thoughts" && renderPosts(postTypes.thoughts)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
