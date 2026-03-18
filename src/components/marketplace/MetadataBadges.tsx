'use client';

import React from 'react';
import { type TechSpecs } from '@/lib/data';

interface MetadataBadgesProps {
  techSpecs?: TechSpecs;
  category: string;
}

const BADGE_STYLES = {
  gpuType: 'border border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
  vram: 'border border-purple-500/30 text-purple-300 bg-purple-500/10',
  framework: 'border border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
  tokenCount: 'border border-pink-500/30 text-pink-300 bg-pink-500/10',
  condition: 'border border-blue-500/30 text-blue-300 bg-blue-500/10',
};

export default function MetadataBadges({ techSpecs, category }: MetadataBadgesProps) {
  if (!techSpecs) return null;

  const badges: React.ReactNode[] = [];

  if (techSpecs.gpuType) {
    badges.push(
      <span key="gpu" className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE_STYLES.gpuType}`}>
        🚀 {techSpecs.gpuType}
      </span>
    );
  }

  if (techSpecs.vram) {
    badges.push(
      <span key="vram" className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE_STYLES.vram}`}>
        💜 {techSpecs.vram}GB VRAM
      </span>
    );
  }

  if (techSpecs.framework?.length) {
    badges.push(
      <span key="fw" className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE_STYLES.framework}`}>
        🚤 {techSpecs.framework.slice(0, 2).join(' ')}
      </span>
    );
  }

  if (techSpecs.tokenCount) {
    badges.push(
      <span key="tokens" className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE_STYLES.tokenCount}`}>
        🚀 {techSpecs.tokenCount.toLocaleString()} tokens
      </span>
    );
  }

  if (techSpecs.condition) {
    badges.push(
      <span key="cond" className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE_STYLES.condition}`}>
        🌟 {techSpecs.condition}
      </span>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {badges}
    </div>
  );
}
