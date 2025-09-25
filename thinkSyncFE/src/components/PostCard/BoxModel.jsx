import { AnimatePresence, motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const BoxModal = ({ post, activeIndex, setActiveIndex }) => (
  <AnimatePresence>
    {activeIndex !== null && (
      <motion.div
        className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-sm"
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
            key={post.media[activeIndex].id}
            src={post.media[activeIndex].url}
            alt="fullscreen"
            className="max-h-[90vh] w-auto mx-auto rounded-lg shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.8)" }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 text-white text-xl p-3 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
            onClick={() => setActiveIndex(null)}
          >
            <FaTimes />
          </motion.button>

          {activeIndex > 0 && (
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.8)" }}
              whileTap={{ scale: 0.9 }}
              className="absolute left-4 text-white text-xl p-3 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
              onClick={() => setActiveIndex((i) => i - 1)}
            >
              <FaChevronLeft />
            </motion.button>
          )}
          {activeIndex < post.media.length - 1 && (
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.8)" }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 text-white text-xl p-3 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
              onClick={() => setActiveIndex((i) => i + 1)}
            >
              <FaChevronRight />
            </motion.button>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {activeIndex + 1} of {post.media.length}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default BoxModal;
