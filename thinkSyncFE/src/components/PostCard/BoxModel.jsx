import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { createPortal } from "react-dom";

const BoxModal = ({ post, activeIndex, setActiveIndex }) => {
  if (activeIndex === null) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setActiveIndex(null)}
      >
        <div
          className="relative max-w-4xl w-full px-4 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            layoutId={`post-media-${post.media[activeIndex].id}`}
            src={post.media[activeIndex].url}
            alt="preview"
            className="max-h-[90vh] w-auto mx-auto rounded-lg object-contain"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25 }}
          />

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 text-white text-xl p-3 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
            onClick={() => setActiveIndex(null)}
          >
            <FaTimes />
          </motion.button>

          {/* Previous */}
          {activeIndex > 0 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute left-4 text-white text-xl p-3 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
              onClick={() => setActiveIndex((i) => i - 1)}
            >
              <FaChevronLeft />
            </motion.button>
          )}

          {/* Next */}
          {activeIndex < post.media.length - 1 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 text-white text-xl p-3 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
              onClick={() => setActiveIndex((i) => i + 1)}
            >
              <FaChevronRight />
            </motion.button>
          )}

          {/* Counter */}
          <div className="absolute top-full left-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {activeIndex + 1} of {post.media.length}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default BoxModal;
