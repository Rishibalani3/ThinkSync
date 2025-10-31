import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import api from "../../utils/axios";

export default function InterestSelector({ isOpen, onClose }) {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    api
      .get("/topics")
      .then((res) => {
        setTopics(res.data);
        // Pre-select topics that are already selected by user
        const preSelected = res.data
          .filter((topic) => topic.isSelected)
          .map((topic) => topic.id);
        setSelected(preSelected);
      })
      .catch(console.error);
  }, [isOpen]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    api
      .post("/topics", { topicIds: selected })
      .then(() => onClose())
      .catch(console.error);
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
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl relative flex flex-col z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute cursor-pointer top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <FaTimes size={18} />
            </button>

            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
              Select Your Interests
            </h2>
            <p className="text-sm text-green-400 pb-4">
              This might change your suggestions and recommendations
            </p>

            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => toggleSelect(topic.id)}
                  className={`px-3 py-1 rounded-full border transition-colors duration-200
                    ${
                      selected.includes(topic.id)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
