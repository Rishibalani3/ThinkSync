import React, { useState } from 'react';
import { FiImage, FiBarChart2, FiTag, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';

const types = [
  { key: 'idea', label: 'Idea', emoji: '💡', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { key: 'question', label: 'Question', emoji: '❓', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { key: 'thought', label: 'Thought', emoji: '💭', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { key: 'link', label: 'Link', emoji: '🔗', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
];

export default function PostCreator() {
  const [active, setActive] = useState('idea');
  const placeholders = {
    idea: "What's your nascent concept or project idea? Share something that's just beginning to form...",
    question: 'What question is burning in your mind? Ask the community anything...',
    thought: "Share a musing, observation, or shower thought that's been floating around...",
    link: 'Share an external resource with your thoughts attached...'
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-5">
      <div className="flex gap-2 mb-4 flex-wrap">
        {types.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${active === t.key ? `${t.color}` : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <motion.textarea
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        rows={4}
        placeholder={placeholders[active]}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-y mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white text-black transition-colors" title="Add image"><FiImage /></button>
          <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white text-black transition-colors" title="Add poll"><FiBarChart2 /></button>
          <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white text-black transition-colors" title="Add tag"><FiTag /></button>
          <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white text-black transition-colors" title="AI assist"><FiCpu /></button>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium">Share Thought</motion.button>
      </div>
    </div>
  );
} 