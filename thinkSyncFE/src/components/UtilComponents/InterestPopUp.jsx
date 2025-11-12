import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import api from "../../utils/axios";
import useAIRecommendations from "../../hooks/useAIRecommendations";

export default function InterestSelector({ isOpen, onClose }) {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getRecommendedTopics, getAITrendingTopics } = useAIRecommendations();

  useEffect(() => {
    if (!isOpen) return;

    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        const [allTopicsResult, recommendedResult, trendingResult] =
          await Promise.allSettled([
            api.get("/topics"),
            getRecommendedTopics ? getRecommendedTopics(30) : [],
            getAITrendingTopics ? getAITrendingTopics(20) : [],
          ]);

        const allTopics =
          allTopicsResult.status === "fulfilled"
            ? allTopicsResult.value.data || []
            : [];

        const preSelected = allTopics
          .filter((topic) => topic.isSelected)
          .map((topic) => topic.id);
        setSelected(preSelected);

        const recommended =
          recommendedResult.status === "fulfilled"
            ? recommendedResult.value || []
            : [];
        const trending =
          trendingResult.status === "fulfilled"
            ? trendingResult.value || []
            : [];

        const recommendedMap = new Map(
          recommended.map((topic) => [topic.id, topic])
        );
        const trendingMap = new Map(
          trending.map((topic) => [topic.id, topic])
        );

        let prioritizedIds = [];
        if (recommended.length) {
          prioritizedIds = recommended
            .slice()
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .map((topic) => topic.id);
        } else if (trending.length) {
          prioritizedIds = trending
            .slice()
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .map((topic) => topic.id);
        }

        const isMeaningfulName = (name = "") => {
          const trimmed = name.trim();
          if (trimmed.length < 3) return false;
          const banned = new Set([
            "test",
            "random",
            "misc",
            "other",
            "general",
            "sample",
            "junk",
          ]);
          if (banned.has(trimmed.toLowerCase())) return false;
          return true;
        };

        let filteredTopics = allTopics.filter((topic) =>
          prioritizedIds.includes(topic.id)
        );

        if (!filteredTopics.length) {
          filteredTopics = allTopics.filter((topic) =>
            isMeaningfulName(topic.name)
          );
        }

        if (!filteredTopics.length) {
          filteredTopics = allTopics;
        }

        const dedupedTopics = [];
        const seen = new Set();
        for (const topic of filteredTopics) {
          if (!topic?.id || seen.has(topic.id)) continue;
          seen.add(topic.id);
          dedupedTopics.push(topic);
        }

        const preparedTopics = dedupedTopics
          .map((topic) => {
            const rec = recommendedMap.get(topic.id);
            const trend = trendingMap.get(topic.id);
            const rawScore = rec?.score ?? trend?.score ?? 0;
            let scoreBadge = null;
            if (rawScore) {
              scoreBadge =
                rawScore > 1
                  ? Math.min(Math.round(rawScore), 99)
                  : Math.round(rawScore * 100);
            }
            return {
              id: topic.id,
              name: topic.name,
              isSelected: preSelected.includes(topic.id),
              reason:
                rec?.reason ||
                (trend ? "Trending in the community" : null),
              score: scoreBadge,
              isRecommended: Boolean(rec),
              isTrending: Boolean(trend && !rec),
            };
          })
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 24);

        setTopics(preparedTopics);
      } catch (error) {
        console.error("Failed to load topics:", error);
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [isOpen, getRecommendedTopics, getAITrendingTopics]);

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
              {isLoading ? (
                <div className="w-full py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading curated interests...
                </div>
              ) : topics.length === 0 ? (
                <div className="w-full py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No tailored topics available yet. Explore the platform to get better ideas.
                </div>
              ) : (
                topics.map((topic) => {
                  const isSelected = selected.includes(topic.id);
                  const scoreLabel =
                    topic.score && topic.score <= 100
                      ? `${topic.score}%`
                      : topic.score
                      ? `${topic.score}`
                      : null;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => toggleSelect(topic.id)}
                      className={`w-full sm:w-auto flex-1 min-w-[140px] px-3 py-2 rounded-xl border transition-colors duration-200 text-left ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400"
                      } ${
                        topic.isRecommended && !isSelected
                          ? "border-blue-300 dark:border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{topic.name}</p>
                          {topic.reason && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                              {topic.reason}
                            </p>
                          )}
                        </div>
                        {scoreLabel && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-300">
                            <FaStar className="text-[10px]" />
                            {scoreLabel}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
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
