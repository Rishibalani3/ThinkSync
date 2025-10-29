import React, { useState } from "react";
import axios from "../../utils/axios";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

export default function ReportPost({
  ContentId,
  onClose,
  heading = "Report Post",
  isComment = false,
}) {
  const [reason, setReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setMessage("Please select a reason before submitting.");
      return;
    }

    const finalReason = reason === "other" ? otherText.trim() : reason;
    if (reason === "other" && !finalReason) {
      setMessage("Please specify the reason.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/moderation/report/create", {
        [isComment ? "commentID" : "postId"]: ContentId,
        type: isComment ? "comment" : "post",
        reason: finalReason,
      });

      setMessage(response.data.message || "Report submitted successfully.");
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Error submitting report.";
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const reportPost = (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-sm z-[100]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
          {heading}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col">
            <span className="mb-1 dark:text-gray-100">Reason:</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="border border-gray-300 rounded-md p-2 bg-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="abusive_content">Abusive Content</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
          </label>

          {reason === "other" && (
            <label className="flex flex-col">
              <span className="mb-1">Please specify:</span>
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                className="border border-gray-300 rounded-md p-2 bg-transparent"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.toLowerCase().includes("error")
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );

  return createPortal(reportPost, document.body);
}
