import React from 'react';

export default function SidebarRight() {
  return (
    <aside className="lg:col-span-1">
      <div className="space-y-4 sticky top-24">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-base">🔥 Trending Topics</h3>
          <div className="space-y-3">
            {[
              ['AIethics', 1247],
              ['climatetech', 892],
              ['remotework', 743],
              ['mentalhealth', 634],
            ].map(([topic, count]) => (
              <div key={topic} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded -m-2 transition-colors">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">#{topic}</div>
                <div className="text-slate-400 text-xs">{count.toLocaleString()} thoughts</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-base">🎯 For You</h3>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg mb-4">
            <div className="text-sm font-bold">🤖 AI INSIGHT</div>
            <p className="text-sm opacity-90 mt-1">Based on your activity, you might enjoy thoughts about technology, psychology, and creative problem-solving.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-base">🔗 Recent Connections</h3>
          <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            Your question about "digital minimalism" connected with 3 similar thoughts.
            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">View connections →</a>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-base">⚡ Quick Actions</h3>
          <div className="space-y-2">
            {['Draft Ideas', 'Browse by Tag', 'Find Thinkers', 'View Insights'].map(a => (
              <button key={a} className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-sm">
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
} 