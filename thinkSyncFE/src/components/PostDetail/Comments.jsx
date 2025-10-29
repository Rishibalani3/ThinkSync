import { FaHeart, FaReply, FaEllipsisH } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import ReportPost from "../PostCard/ReportPost"; // make sure path is correct

const Comments = ({ node, depth = 0, parentAuthor, onReply, onToggleLike }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showReport, setShowReport] = useState(false); // state for report modal

  const repliesToShow = showAllReplies
    ? node.replies || []
    : (node.replies || []).slice(0, 1);

  return (
    <div className="mt-5">
      <div className="flex gap-3 items-start relative">
        {/* Author avatar */}
        <Link to={`/profile/${node.author?.username}`}>
          <img
            src={node.author?.details?.avatar || "https://placehold.co/40x40"}
            alt={node.author?.displayName}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-600"
          />
        </Link>

        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 relative">
            {/* Three-dot menu for report */}
            <button
              onClick={() => setShowReport(true)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <FaEllipsisH size={16} />
            </button>

            {/* Author info */}
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/profile/${node.author?.username}`}>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm hover:underline">
                  {node.author?.displayName}
                </span>
              </Link>
              <Link to={`/profile/${node.author?.username}`}>
                <span className="text-xs text-gray-500 hover:underline">
                  @{node.author?.username}
                </span>
              </Link>
            </div>

            {/* Replying to (for nested replies) */}
            {depth > 0 && parentAuthor && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Replying to{" "}
                <Link to={`/profile/${parentAuthor}`}>
                  <span className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    @{parentAuthor}
                  </span>
                </Link>
              </div>
            )}

            {/* Comment content */}
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
              {node.content}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 ml-1 text-xs">
            <button
              onClick={() => onToggleLike(node.id)}
              className={`flex items-center gap-1 transition-colors ${
                node.isLiked
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-red-600"
              }`}
            >
              <FaHeart className={node.isLiked ? "fill-current" : ""} />
              <span>{node.likesCount || 0}</span>
            </button>

            <button
              onClick={() => setShowReply((prev) => !prev)}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FaReply />
              <span>Reply</span>
            </button>
          </div>

          {/* Reply input */}
          {showReply && (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyText.trim()) return;
                onReply(node.id, replyText, () => {
                  setReplyText("");
                  setShowReply(false);
                });
              }}
            >
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Write a reply..."
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Reply
              </button>
            </form>
          )}

          {/* Replies */}
          {node.replies?.length > 0 && (
            <div className="mt-3 pl-6 border-l border-gray-300 dark:border-gray-700 space-y-3">
              {repliesToShow.map((reply) => (
                <div key={reply.id}>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Replying to{" "}
                    <Link
                      to={`/profile/${
                        reply.parentAuthor || node.author?.username
                      }`}
                    >
                      <span className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                        @{reply.parentAuthor || node.author?.username}
                      </span>
                    </Link>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    {reply.content}
                  </div>
                </div>
              ))}

              {node.replies.length > 1 && (
                <button
                  onClick={() => setShowAllReplies((s) => !s)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 font-medium"
                >
                  {showAllReplies
                    ? "Hide replies"
                    : `View ${node.replies.length - 1} more repl${
                        node.replies.length - 1 === 1 ? "y" : "ies"
                      }`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Report modal */}
        {showReport && (
          <ReportPost
            ContentId={node.id}
            onClose={() => setShowReport(false)}
            heading="Report Comment"
            isComment={true}
          />
        )}
      </div>
    </div>
  );
};

export default Comments;
