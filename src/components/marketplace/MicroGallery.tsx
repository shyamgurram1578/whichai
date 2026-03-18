'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface MicroGalleryProps {
  images: string[];
  alt: string;
  categoryEmoji?: string;
}

export default function MicroGallery({ images, alt, categoryEmoji }: MicroGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [autoTimer, setAutoTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovering && images.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, 1200);
      setAutoTimer(timer);
      return () => clearInterval(timer);
    }
  }, [isHovering, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-40 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 rounded-t-lg flex items-center justify-center overflow-hidden">
        {categoryEmoji && <div className="text-6xl opacity-30">{categoryEmoji}</div>}
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-40 bg-black rounded-t-lg overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        if (autoTimer) clearInterval(autoTimer);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Image
            src={images[current]}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`rounded-full transition-all ${
                idx === current
                  ? 'bg-cyan-400 w-2 h-2'
                  : 'bg-white/30 w-1.5 h-1.5 hover:bg-white/50'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
