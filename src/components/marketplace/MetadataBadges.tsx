'use client';

import React from 'react';
import { TechSpecs } from '@/lib/data';

interface MetadataBadgesProps {
  techSpecs?: TechSpecs;
  category: string;
}

export default function MetadataBadges({ techSpecs, category }: MetadataBadgesProps) {
  if (!techSpecs) return null;

  const badges: Array<{ label: string; value: string; color: string }> = [];

  if (techSpecs.gpuType) {
    badges.push({ label: 'GPU', value: techSpecs.gpuType, color: 'cyan' });
  }

  if (techSpecs.vram) {
    badges.push({ label: 'VRAM', value: `${techSpecs.vram}GB`, color: 'purple' });
  }

  if (techSpecs.framework && techSpecs.framework.length > 0) {
    badges.push({ label: 'FW', value: techSpecs.framework[0], color: 'green' });
  }

  if (techSpecs.tokenCount) {
    badges.push({
      label: 'Tokens',
      value: `${(techSpecs.tokenCount / 1000).toFixed(0)}K`,
      color: 'pink',
    });
  }

  if (techSpecs.condition) {
    badges.push({ label: 'Cond.', value: techSpecs.condition, color: 'blue' });
  }

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
    green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {badges.map((badge, idx) => {
        const style = colorMap[badge.color];
        return (
          <span
            key={idx}
            className={`px-2 py-0.5 text-xs rounded-full ${style.bg} border ${style.border} ${style.text} font-mono`}
          >
            {badge.value}
          </span>
        );
      })}
    </div>
  );
}
