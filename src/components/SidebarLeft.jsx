import React from 'react';
import { FiHome, FiCompass, FiZap, FiActivity, FiSettings, FiShare2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Home', icon: <FiHome /> },
  { label: 'Explore', icon: <FiCompass /> },
  { label: 'My Ideas', icon: <FiShare2 /> },
  { label: 'Connections', icon: <FiZap /> },
  { label: 'Analytics', icon: <FiActivity /> },
  { label: 'Settings', icon: <FiSettings /> },
];

export default function SidebarLeft() {
  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-24">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Navigation</h3>
            <nav className="space-y-1">
              {navItems.map((item, idx) => (
                <motion.a
                  key={item.label}
                  href="#"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * (idx + 1) }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400`}
                >
                  <span className="text-slate-500 dark:text-slate-400">{item.icon}</span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Your Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Thoughts shared:</span><span className="text-indigo-600 dark:text-indigo-400 font-bold">24</span></div>
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Connections made:</span><span className="text-indigo-600 dark:text-indigo-400 font-bold">156</span></div>
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Ideas built upon:</span><span className="text-indigo-600 dark:text-indigo-400 font-bold">43</span></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
} 