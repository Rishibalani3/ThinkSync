import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTwitter,
  FaWhatsapp,
  FaLink,
  FaTimes,
  FaTelegram,
} from "react-icons/fa";

export default function ShareModal({ isOpen, onClose, post }) {
  if (!isOpen) return null;

  const postUrl = `${window.location.origin}/post/${post.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      const toast = document.createElement("div");
      toast.textContent = "Link copied!";
      toast.className =
        "fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg z-[200]";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
    } catch {
      alert("Failed to copy link");
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-80 sm:w-96 shadow-2xl relative flex flex-col items-center text-center border border-gray-200/50 dark:border-gray-700/50"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute cursor-pointer top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <FaTimes size={18} />
            </button>

            <h2 className="text-xl font-semibold mb-5 text-gray-800 dark:text-gray-100">
              Share this post
            </h2>

            <div className="flex justify-center gap-6">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  postUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:scale-110 hover:text-blue-400 transition-transform"
                title="Share on Twitter"
              >
                <FaTwitter size={28} />
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:scale-110 hover:text-green-400 transition-transform"
                title="Share on WhatsApp"
              >
                <FaWhatsapp size={28} />
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  postUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-500 hover:scale-110 hover:text-sky-400 transition-transform"
                title="Share on Telegram"
              >
                <FaTelegram size={28} />
              </a>

              <button
                onClick={handleCopy}
                className="cursor-pointer text-gray-600 dark:text-gray-300 hover:scale-110 hover:text-blue-500 dark:hover:text-blue-400 transition-transform"
                title="Copy Link"
              >
                <FaLink size={28} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
