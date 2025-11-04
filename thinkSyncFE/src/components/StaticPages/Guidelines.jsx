import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaGavel, FaCheckCircle } from "react-icons/fa";
import MainLayout from "../../layouts/MainLayout";
import api from "../../utils/axios";

const Guidelines = () => {
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        const res = await api.get("/admin/guidelines");
        const data = res.data.data || [];
        // Filter only active guidelines
        const active = data.filter((g) => g.isActive);
        // Group by category
        const grouped = active.reduce((acc, guideline) => {
          if (!acc[guideline.category]) {
            acc[guideline.category] = [];
          }
          acc[guideline.category].push(guideline);
          return acc;
        }, {});
        // Sort guidelines within each category by order
        Object.keys(grouped).forEach((category) => {
          grouped[category].sort((a, b) => (a.order || 0) - (b.order || 0));
        });
        setGuidelines(grouped);
      } catch (error) {
        console.error("Failed to fetch guidelines:", error);
        setGuidelines({});
      } finally {
        setLoading(false);
      }
    };
    fetchGuidelines();
  }, []);

  const categoryLabels = {
    content: "Content Guidelines",
    behavior: "Community Behavior",
    privacy: "Privacy & Safety",
    safety: "Safety Guidelines",
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto py-12 px-4"
      >
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaGavel className="text-5xl text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Community Guidelines
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Rules and expectations for our community
          </p>
        </div>

        {Object.keys(guidelines).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No guidelines available at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(guidelines).map(([category, items]) => (
              <section
                key={category}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {categoryLabels[category] ||
                    category.charAt(0).toUpperCase() + category.slice(1)}
                </h2>
                <div className="space-y-6">
                  {items.map((guideline) => (
                    <div
                      key={guideline.id}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <FaCheckCircle className="text-blue-500" />
                        {guideline.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {guideline.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Questions about our guidelines? Contact us at{" "}
            <a
              href="mailto:support@thinksync.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              support@thinksync.com
            </a>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default Guidelines;
