import { useState } from "react";
import { motion } from "framer-motion";

import PostCreator from "../components/PostCreator";
import ThoughtCard from "../components/ThoughtCard";
import SidebarLeft from "../components/SidebarLeft";
import SidebarRight from "../components/SidebarRight";

const Home = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: "Sarah Chen",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=SC",
        username: "@sarahchen",
      },
      content:
        "Just had a breakthrough idea about combining AI with sustainable energy systems. What if we could use machine learning to optimize solar panel efficiency in real-time based on weather patterns? 🌱⚡",
      type: "idea",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: 2,
      author: {
        name: "Marcus Rodriguez",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=MR",
        username: "@marcusrod",
      },
      content:
        "Question: How do we balance technological advancement with preserving human connection? Are we becoming more connected or more isolated? 🤔",
      type: "question",
      timestamp: "4 hours ago",
      likes: 15,
      comments: 12,
      shares: 2,
      isLiked: true,
      isBookmarked: false,
    },
    {
      id: 3,
      author: {
        name: "Emma Thompson",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=ET",
        username: "@emmathompson",
      },
      content:
        'Random thought: The best ideas often come when you\'re not actively trying to think of them. Maybe we need more "thinking breaks" in our daily routines. 💭',
      type: "thought",
      timestamp: "6 hours ago",
      likes: 31,
      comments: 5,
      shares: 7,
      isLiked: false,
      isBookmarked: true,
    },
  ]);

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  const handleBookmark = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const handleNewPost = (newPost) => {
    const post = {
      id: Date.now(),
      author: {
        name: "John Doe",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=JD",
        username: "@johndoe",
      },
      content: newPost.content,
      type: newPost.type,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
    };
    setPosts([post, ...posts]);
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-6 p-5">
        {/* Left Sidebar */}
        <aside className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-16">
            <SidebarLeft />
          </div>
        </aside>

        {/* Main Feed (scrollable) */}
        <div className="lg:col-span-5 h-[calc(100vh-4rem)] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Post Creator */}
            <PostCreator onNewPost={handleNewPost} />

            {/* Feed */}
            <div className="space-y-4 mt-6 hide-scrollbar">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <ThoughtCard
                    post={post}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    className="hide-scrollbar"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-16">
            <SidebarRight />
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Home;
