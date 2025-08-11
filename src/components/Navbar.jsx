import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { motion } from 'framer-motion';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Navbar() {
  const { isDark, toggle } = useDarkMode();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            <span role="img" aria-label="brain">🧠</span>
            <span>ThinkSync</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-1 text-sm">
            {['Home', 'Explore', 'Tags', 'Users'].map((item, idx) => (
              <motion.a
                key={item}
                href="#"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (idx + 1) }}
                className={`px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400`}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-72 pl-9 pr-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 placeholder:text-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Search thoughts, ideas, questions..."
            />
          </div>

          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? <HiOutlineMoon size={18} /> : <HiOutlineSun size={18} />}
          </button>

          <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold grid place-items-center">
              JD
            </div>
            <span className="text-slate-700 dark:text-slate-200 text-sm">John Doe</span>
          </div>
        </div>
      </div>
    </nav>
  );
} 