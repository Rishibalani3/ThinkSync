import React from "react";
import { motion } from "framer-motion";
import PostCreator from "./PostCreator";
import PostCard from "./PostCard/PostCard";

const posts = [
  {
    type: "Idea",
    author: "Sarah Mitchell",
    initials: "SM",
    time: "2 hours ago",
    title:
      "What if we created a social media platform where your posts automatically disappear unless someone finds them genuinely valuable?",
    body: `Like, if a post doesn't get meaningful engagement within 24 hours, it vanishes. This could reduce noise and promote quality content. I'm thinking about the psychology behind it - would people post more thoughtfully if they knew their content had to earn its place?`,
    tags: ["socialmedia", "digitalwellbeing", "contentcuration"],
    connections: 3,
    defaultVotes: 23,
  },
  {
    type: "Question",
    author: "Alex Lee",
    initials: "AL",
    time: "4 hours ago",
    title:
      "Why do we still use QWERTY keyboards when there are more efficient layouts like Dvorak?",
    body: "Is it just because of historical momentum, or are there actual advantages I'm missing? I've been curious about this for a while but never found a definitive answer.",
    tags: ["technology", "design", "efficiency"],
    connections: 0,
    defaultVotes: 15,
  },
  {
    type: "Thought",
    author: "Maya Rodriguez",
    initials: "MR",
    time: "6 hours ago",
    title:
      "Shower thought: What if procrastination is actually our brain's way of giving our subconscious more time to work on problems?",
    body: "Maybe we're not being lazy, we're marinating ideas. Like, sometimes I procrastinate on writing something and when I finally sit down, the words flow much better than they would have originally.",
    tags: ["psychology", "productivity", "mindfulness"],
    connections: 0,
    defaultVotes: 42,
  },
];

export default function Feed() {
  const filters = ["All", "Ideas", "Questions", "Thoughts", "Links"];

  return (
    <div className="lg:col-span-2">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-5 ">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Latest Thoughts
          </h1>
          <a
            href="#"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors flex items-center gap-2"
          >
            ✨ Share a Thought
          </a>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f, i) => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.98 }}
              className={`${
                i === 0
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              } px-4 py-2 rounded-md text-sm`}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </div>

      <PostCreator />

      <div className="space-y-1">
        {posts.map((p, idx) => (
          <PostCard key={idx} {...p} />
        ))}
      </div>

      <div className="flex justify-center items-center gap-3 mt-8 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
        <button className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-md text-sm cursor-not-allowed opacity-50">
          Previous
        </button>
        <button className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">
          1
        </button>
        <button className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm">
          2
        </button>
        <button className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm">
          3
        </button>
        <span className="text-slate-400">...</span>
        <button className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm">
          Next
        </button>
      </div>
    </div>
  );
}
