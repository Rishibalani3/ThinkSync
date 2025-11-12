import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ProfileHeader from "./Header";
import Tabs from "./ProfileTabs";
import PostCard from "./PostCard";
import FollowersModal from "./FollowersModal";
import api from "../../utils/axios";
import NotFound from "../UtilComponents/NotFound";
import useLike from "../../hooks/useLike";
import useBookmark from "../../hooks/useBookmark";
import { showToast } from "../../utils/toast";

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
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  const { toggleLike } = useLike();
  const { toggleBookmark } = useBookmark();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const normalizedUsername = username?.toLowerCase();
        const currentUsername = currentUser?.username?.toLowerCase();
        const isOwn = !username || normalizedUsername === currentUsername;
        let profileUser = currentUser;
        let posts = [];
        let isFollowing = false;

        if (!isOwn) {
          const res = await api.get(`/user/profile/${username}`);
          profileUser = res.data.profileUser;
          posts = res.data.posts || [];
          isFollowing = res.data.isFollowing;
          const followersCount = res.data.followersCount || 0;
          const followingCount = res.data.followingCount || 0;
          
          // Fetch followers and following lists
          try {
            const [followersRes, followingRes] = await Promise.all([
              api.get(`/follower/${profileUser.id}/followers`),
              api.get(`/follower/${profileUser.id}/following`),
            ]);
            setFollowersList(followersRes.data.data || []);
            setFollowingList(followingRes.data.data || []);
          } catch (err) {
            console.error("Failed to fetch followers/following:", err);
          }
          
          setProfileData({
            profileUser,
            posts,
            isOwnProfile: false,
            isFollowing,
            followersCount,
            followingCount,
          });
        } else if (currentUser?.id) {
          const postsRes = await api.get(`/user/${currentUser.id}/posts`);
          posts = postsRes.data || [];
          
          // For own profile, fetch from profile endpoint to get counts
          try {
            const profileRes = await api.get(`/user/profile`);
            profileUser = profileRes.data.profileUser || currentUser;
            const followersCount = profileRes.data.followersCount || 0;
            const followingCount = profileRes.data.followingCount || 0;
            
            if (currentUser?.id) {
              const [followersRes, followingRes] = await Promise.all([
                api.get(`/follower/${currentUser.id}/followers`),
                api.get(`/follower/${currentUser.id}/following`),
              ]);
              setFollowersList(followersRes.data.data || []);
              setFollowingList(followingRes.data.data || []);
            }
            
            setProfileData({
              profileUser,
              posts,
              isOwnProfile: true,
              isFollowing: false,
              followersCount,
              followingCount,
            });
          } catch (err) {
            console.error("Failed to fetch profile data:", err);
            profileUser = currentUser;
            setProfileData({
              profileUser,
              posts,
              isOwnProfile: true,
              isFollowing: false,
              followersCount: 0,
              followingCount: 0,
            });
          }
        } else {
          showToast.error("Unable to load profile data.");
        }

        const ideas = posts.filter((p) => p.type === "idea");
        const questions = posts.filter((p) => p.type === "question");
        const thoughts = posts.filter((p) => p.type === "thought");

        setPostTypes({ ideas, questions, thoughts });
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

  const { profileUser, posts, isOwnProfile, isFollowing, followersCount, followingCount } = profileData;

  const handleFollow = async () => {
    const prevFollowing = isFollowing;
    
    // Optimistic update
    setProfileData((prev) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
    }));

    try {
      const res = await api.post(`/follower/follow/${profileUser.id}`);
      const message = res?.data?.message || "";
      // Backend returns "User followed" (201) or "User unfollowed" (200)
      const isNowFollowing = message.toLowerCase().includes("user followed") || 
                            (res.status === 201 && message.toLowerCase().includes("followed"));
      
      // Update based on server response
      setProfileData((prev) => ({
        ...prev,
        isFollowing: isNowFollowing,
      }));
      
      // Show toast
      if (isNowFollowing) {
        showToast.success(`Now following ${profileUser.displayName || profileUser.username}!`);
      } else {
        showToast.info(`Unfollowed ${profileUser.displayName || profileUser.username}`);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      showToast.error("Failed to update follow status");
      // Rollback on error
      setProfileData((prev) => ({
        ...prev,
        isFollowing: prevFollowing,
      }));
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
    // Optimistic update
    const prevPost = posts.find(p => p.id === postId);
    const prevLiked = prevPost?.isLiked || false;
    const prevLikesCount = prevPost?.likesCount || 0;
    
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
      // Rollback on error
      setProfileData((prev) => {
        const reverted = prev.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: prevLikesCount,
                isLiked: prevLiked,
              }
            : post
        );
        updatePostTypes(reverted);
        return { ...prev, posts: reverted };
      });
    } else if (result?.data) {
      // Update with server response
      setProfileData((prev) => {
        const updatedPosts = prev.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: result.data?.likesCount ?? post.likesCount,
                isLiked: result.action === "like",
              }
            : post
        );
        updatePostTypes(updatedPosts);
        return { ...prev, posts: updatedPosts };
      });
    }
  };

  const handleBookmark = async (postId) => {
    // Optimistic update
    const prevPost = posts.find(p => p.id === postId);
    const prevBookmarked = prevPost?.isBookmarked || false;
    
    setProfileData((prev) => {
      const updatedPosts = prev.posts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      );
      updatePostTypes(updatedPosts);
      return { ...prev, posts: updatedPosts };
    });

    const result = await toggleBookmark(postId);
    if (result?.error) {
      // Rollback on error
      setProfileData((prev) => {
        const reverted = prev.posts.map((post) =>
          post.id === postId
            ? { ...post, isBookmarked: prevBookmarked }
            : post
        );
        updatePostTypes(reverted);
        return { ...prev, posts: reverted };
      });
    }
  };

  const handlePostDelete = (postId) => {
    setProfileData((prev) => {
      const filteredPosts = prev.posts.filter((post) => post.id !== postId);
      updatePostTypes(filteredPosts);
      return { ...prev, posts: filteredPosts };
    });
  };

  const renderPosts = (list) =>
    list.length > 0 ? (
      list.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => handleLike(post.id)}
          onBookmark={() => handleBookmark(post.id)}
          onDelete={handlePostDelete}
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
          followersCount={followersCount}
          followingCount={followingCount}
          onShowFollowers={() => setShowFollowersModal(true)}
          onShowFollowing={() => setShowFollowingModal(true)}
        />

        <FollowersModal
          isOpen={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          users={followersList}
          title="Followers"
        />
        <FollowersModal
          isOpen={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          users={followingList}
          title="Following"
        />

        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl sm:shadow-2xl shadow-blue-500/5 dark:shadow-blue-400/5 overflow-x-auto mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="py-6">
          <div className="flex flex-col gap-4">
            {activeTab === "posts" && renderPosts(posts)}
            {activeTab === "ideas" && renderPosts(postTypes.ideas)}
            {activeTab === "questions" && renderPosts(postTypes.questions)}
            {activeTab === "thoughts" && renderPosts(postTypes.thoughts)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
