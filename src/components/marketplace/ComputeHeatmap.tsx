'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RegionData {
  name: string;
  availability: number;
  gpuCount: number;
  pricePerHour: number;
}

const regions: RegionData[] = [
  { name: 'US-West', availability: 0, gpuCount: 0, pricePerHour: 0 },
  { name: 'US-East', availability: 0, gpuCount: 0, pricePerHour: 0 },
  { name: 'EU-West', availability: 0, gpuCount: 0, pricePerHour: 0 },
  { name: 'EU-East', availability: 0, gpuCount: 0, pricePerHour: 0 },
  { name: 'Asia-SE', availability: 0, gpuCount: 0, pricePerHour: 0 },
  { name: 'Asia-E', availability: 0, gpuCount: 0, pricePerHour: 0 },
  { name: 'AU', availability: 0, gpuCount: 0, pricePerHour: 0 },
  { name: 'ME', availability: 0, gpuCount: 0, pricePerHour: 0 },
];

export default function ComputeHeatmap() {
  const [data, setData] = useState<RegionData[]>(regions);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  useEffect(() => {
    const updateData = () => {
      setData(
        regions.map((region) => ({
          ...region,
          availability: Math.random() * 100,
          gpuCount: Math.floor(Math.random() * 50) + 10,
          pricePerHour: Math.random() * 3 + 1,
        }))
      );
    };

    updateData();
    const timer = setInterval(updateData, 8000);
    return () => clearInterval(timer);
  }, []);

  const getColor = (availability: number) => {
    if (availability > 70) return 'from-green-50 to-emerald-50';
    if (availability > 40) return 'from-yellow-50 to-amber-50';
    return 'from-red-50 to-rose-50';
  };

  const getBorderColor = (availability: number) => {
    if (availability > 70) return 'border-green-300 hover:border-green-500';
    if (availability > 40) return 'border-yellow-300 hover:border-yellow-500';
    return 'border-red-300 hover:border-red-500';
  };

  return (
    <div className="w-full mb-6">
      <h3 className="text-slate-900 font-semibold mb-4">🌍 Global GPU Availability</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.map((region, idx) => (
          <motion.div
            key={region.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onMouseEnter={() => setHoveredRegion(region.name)}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`p-4 rounded-lg border transition-all cursor-pointer bg-gradient-to-br ${getColor(region.availability)} ${getBorderColor(region.availability)}`}
            whileHover={{ scale: 1.05 }}
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">{region.name}</p>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${region.availability}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                />
              </div>
              <div className="text-xs text-slate-600">
                <p>{region.availability.toFixed(0)}% Available</p>
                <p>{region.gpuCount} GPUs</p>
              </div>
            </div>
            {hoveredRegion === region.name && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute mt-2 px-3 py-2 bg-slate-900 rounded text-xs text-white whitespace-nowrap pointer-events-none"
              >
                ${region.pricePerHour.toFixed(2)}/hr
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
