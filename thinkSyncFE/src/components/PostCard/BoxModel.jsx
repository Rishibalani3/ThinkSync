import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { createPortal } from "react-dom";

const BoxModal = ({ post, activeIndex, setActiveIndex }) => {
  if (activeIndex === null) return null;

  const media = post.media[activeIndex];

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="modal"
        style={{
          height: "100dvh",
          position: "sticky",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(0,0,0,0.95)",
          backdropFilter: "blur(6px)",
        }}
        onClick={() => setActiveIndex(null)}
      >
        <div
          className="relative w-full h-[100dvh] flex items-center justify-center px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            layoutId={`post-media-${media.id}`}
            src={media.url}
            alt="preview"
            className="max-w-[95vw] max-h-[95dvh] object-contain rounded-lg"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25 }}
          />

          {/* Controls */}
          <button
            onClick={() => setActiveIndex(null)}
            className="absolute top-6 right-6 text-white text-2xl p-3 bg-black/60 rounded-full hover:bg-black/80 transition"
          >
            <FaTimes />
          </button>

          {activeIndex > 0 && (
            <button
              onClick={() => setActiveIndex((i) => i - 1)}
              className="absolute left-6 text-white text-2xl p-3 bg-black/60 rounded-full hover:bg-black/80 transition"
            >
              <FaChevronLeft />
            </button>
          )}

          {activeIndex < post.media.length - 1 && (
            <button
              onClick={() => setActiveIndex((i) => i + 1)}
              className="absolute right-6 text-white text-2xl p-3 bg-black/60 rounded-full hover:bg-black/80 transition"
            >
              <FaChevronRight />
            </button>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {activeIndex + 1} of {post.media.length}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default BoxModal;
