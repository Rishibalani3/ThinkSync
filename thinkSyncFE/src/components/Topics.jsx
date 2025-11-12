import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostCard from "./PostCard/PostCard";
import LoadingScreen from "./LoadingScreen";
import useTopics from "../hooks/useTopics";

const Topics = () => {
  const { getPostsByTopic } = useTopics();
  const { selectedTopic } = useParams(); // topic name from URL

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Fetch posts whenever the topic from URL changes
  useEffect(() => {
    if (!selectedTopic) return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      const data = await getPostsByTopic(selectedTopic);
      setPosts(data);
      setLoadingPosts(false);
    };

    fetchPosts();
  }, [selectedTopic, getPostsByTopic]);

  if (loadingPosts) return <LoadingScreen />;

  return (
    <div className="w-full min-h-screen flex justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-4xl  space-y-6">
        <h1 className="text-3xl font-extrabold text-center mb-6">
          Results for "{selectedTopic}"
        </h1>

        {posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No posts found for{" "}
            <span className="font-semibold">{selectedTopic}</span>.
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Topics;
