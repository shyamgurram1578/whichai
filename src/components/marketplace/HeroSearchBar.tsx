'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';

interface HeroSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterToggle: () => void;
  filterCount: number;
}

const quickTags = ['🔥 Trending', '⚡ GPU Rentals', '🤖 Agents', '💎 Premium'];

export default function HeroSearchBar({
  value,
  onChange,
  onFilterToggle,
  filterCount,
}: HeroSearchBarProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <div className="w-full space-y-4">
      <motion.div
        className="relative"
        animate={{ width: focused ? '100%' : '85%' }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`relative rounded-lg overflow-hidden transition-all ${
            focused ? 'glow-cyan' : ''
          }`}
        >
          <div className={`absolute inset-0 rounded-lg transition-opacity ${
            focused
              ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-100'
              : 'bg-gradient-to-r from-purple-500/0 to-cyan-500/0 opacity-0'
          }`} />

          <div className="relative bg-[#0d1117] border border-white/10 hover:border-purple-500/30 rounded-lg p-3 flex items-center gap-3 transition-colors">
            <Search size={18} className="text-gray-500" />

            <input
              type="text"
              placeholder="Search prompts, GPUs, hardware..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
            />

            <motion.button
              onClick={onFilterToggle}
              whileHover={{ scale: 1.05 }}
              className="relative text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <Filter size={18} />
              {filterCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {filterCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick tags row */}
      <div className="flex gap-2 flex-wrap">
        {quickTags.map((tag) => (
          <motion.button
            key={tag}
            whileHover={{ scale: 1.05, y: -2 }}
            onClick={() => onChange(tag.split(' ')[1] || '')}
            className="px-3 py-1 text-xs rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
          >
            {tag}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
