import { useEffect, useState } from "react";
import useBookmark from "../hooks/useBookmark";
import PostCard from "./PostCard/PostCard";
import LoadingScreen from "./LoadingScreen";

const Bookmarks = () => {
  const { getBookmarks, toggleBookmark } = useBookmark();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      const data = await getBookmarks();
      setBookmarks(data);
      setLoading(false);
    };
    fetchBookmarks();
  }, []);

  const handleBookmarkToggle = async (postId) => {
    const result = await toggleBookmark(postId);

    if (result?.action === "unbookmark") {
      setBookmarks((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className=" w-full h-full min-h-screen mx-auto  px-4 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 shadow-md">
      {bookmarks.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No bookmarks yet.</p>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onBookmark={() => handleBookmarkToggle(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
