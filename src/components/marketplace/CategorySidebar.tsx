'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Monitor, ChevronDown } from 'lucide-react';

interface CategorySidebarProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  activeSub: string;
  onSubChange: (sub: string) => void;
}

const categories = [
  {
    key: 'digital-assets',
    label: 'Digital Assets',
    icon: Brain,
    subs: ['Prompts', 'LoRAs', 'Fine-tuned Models', 'Agents'],
  },
  {
    key: 'compute-hub',
    label: 'Compute Hub',
    icon: Cpu,
    subs: ['H100s', 'A100s', 'RTX 4090s', 'Subscriptions'],
  },
  {
    key: 'hardware-corner',
    label: 'Hardware Corner',
    icon: Monitor,
    subs: ['Servers', 'Edge Kits', 'Workstations', 'Laptops'],
  },
];

export default function CategorySidebar({
  activeCategory,
  onCategoryChange,
  activeSub,
  onSubChange,
}: CategorySidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'digital-assets': true,
    'compute-hub': false,
    'hardware-corner': false,
  });

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="sticky top-24 h-fit w-64 flex-shrink-0 hidden lg:block">
      <div className="glass-dark neon-border-purple rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-bold text-white mb-6">Categories</h3>

        {categories.map((category) => {
          const IconComponent = category.icon;
          const isActive = activeCategory === category.key;
          const isExpanded = expanded[category.key];

          return (
            <div key={category.key} className="space-y-2">
              <motion.button
                onClick={() => {
                  onCategoryChange(category.key);
                  toggleExpand(category.key);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-500/20 border border-purple-500/50 text-purple-200'
                    : 'text-gray-300 hover:bg-purple-500/10 hover:border hover:border-purple-500/30'
                }`}
                whileHover={{ x: 4 }}
              >
                <IconComponent size={18} />
                <span className="flex-1 text-left text-sm font-medium">{category.label}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 pl-7">
                      {category.subs.map((sub) => (
                        <motion.button
                          key={sub}
                          onClick={() => onSubChange(sub)}
                          className={`block w-full text-left px-2 py-1.5 text-xs rounded transition-all ${
                            activeSub === sub
                              ? 'text-cyan-300 bg-cyan-500/10 border-l-2 border-cyan-500'
                              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                          }`}
                          whileHover={{ x: 2 }}
                        >
                          {sub}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
