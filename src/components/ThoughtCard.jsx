import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiThumbsUp, FiMessageCircle, FiHelpCircle, FiTrendingUp, FiChevronUp, FiChevronDown } from 'react-icons/fi';

export default function ThoughtCard({ type, author, initials, time, title, body, tags = [], connections = 0, defaultVotes = 0 }) {
  const [votes, setVotes] = useState(defaultVotes);
  const [voteState, setVoteState] = useState(null); // 'up' | 'down' | null

  const onVote = dir => {
    if (voteState === dir) return; // prevent double
    const delta = dir === 'up' ? 1 : -1;
    setVotes(prev => prev + (voteState ? (dir === 'up' ? 2 : -2) : delta));
    setVoteState(dir);
  };

  const pill = {
    Idea: 'bg-indigo-900/50 text-indigo-300',
    Question: 'bg-amber-900/50 text-amber-300',
    Thought: 'bg-emerald-900/50 text-emerald-300',
    Link: 'bg-sky-900/50 text-sky-300',
  }[type] || 'bg-slate-800 text-slate-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
    >
      <div className="p-5 flex gap-4">
        <div className="flex flex-col items-center min-w-10">
          <button onClick={() => onVote('up')} className={`p-1 rounded-lg ${voteState === 'up' ? 'text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><FiChevronUp /></button>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 my-1">{votes}</span>
          <button onClick={() => onVote('down')} className={`p-1 rounded-lg ${voteState === 'down' ? 'text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><FiChevronDown /></button>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${pill}`}>{type}</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold grid place-items-center">{initials}</div>
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">{author}</a>
              <span className="text-slate-400 text-sm">{time}</span>
            </div>
            {connections > 0 && (
              <div className="ml-auto">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded">{connections} connections</span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 leading-tight">{title}</h3>
          {body && <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{body}</p>}

          {type === 'Idea' && (
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-4 mb-4 text-slate-200">
              <div className="text-xs font-bold mb-1">🤖 AI SUMMARY</div>
              <p className="text-sm">This idea explores ephemeral social media with quality-based content persistence, addressing information overload and encouraging thoughtful posting through gamified content curation.</p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map(tag => (
                <a key={tag} href="#" className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors">#{tag}</a>
              ))}
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"><FiTrendingUp /> Intriguing</button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"><FiHelpCircle /> Clarify?</button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"><FiThumbsUp /> Agree</button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"><FiMessageCircle /> Reply</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 