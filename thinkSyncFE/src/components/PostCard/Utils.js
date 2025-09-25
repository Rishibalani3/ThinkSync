export const getTypeColor = (type) => {
  switch (type) {
    case "idea":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
    case "question":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
    case "thought":
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
    default:
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200";
  }
};

export const formatTimeAgo = (dateString) => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;

  return postDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: postDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};
