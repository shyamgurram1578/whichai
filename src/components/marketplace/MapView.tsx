'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MarketListingV3 } from '@/lib/data';

interface MapViewProps {
  listings: MarketListingV3[];
  userLocation?: { lat: number; lng: number };
  radiusMiles: number;
}

export default function MapView({ listings, userLocation, radiusMiles }: MapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Simple Mercator-like projection
    const mercator = (lat: number, lng: number) => {
      const x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      return { x, y };
    };

    // Draw user location if available
    if (userLocation) {
      const userPos = mercator(userLocation.lat, userLocation.lng);

      // Radius circle
      const radiusPixels = (radiusMiles / 24901) * width;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(userPos.x, userPos.y, radiusPixels, 0, Math.PI * 2);
      ctx.stroke();

      // Pulsing user dot
      const pulse = Math.sin(Date.now() / 500) * 0.5 + 1;
      ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.8})`;
      ctx.beginPath();
      ctx.arc(userPos.x, userPos.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw listings
    const categoryColors: Record<string, string> = {
      'digital-assets': 'rgba(168, 85, 247, 0.8)', // purple
      'compute-hub': 'rgba(6, 182, 212, 0.8)', // cyan
      'hardware-corner': 'rgba(34, 197, 94, 0.8)', // green
    };

    listings.forEach((listing) => {
      if (!listing.location) return;
      const pos = mercator(listing.location.lat, listing.location.lng);
      const color = categoryColors[listing.bigCategory] || 'rgba(255, 255, 255, 0.8)';

      // Glow
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 8);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color.replace('0.8', '0'));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw legend
    const legendX = width - 140;
    const legendY = height - 100;
    ctx.fillStyle = 'rgba(13, 17, 23, 0.9)';
    ctx.fillRect(legendX, legendY, 130, 90);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 130, 90);

    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('Legend', legendX + 8, legendY + 18);

    const legends = [
      { color: 'rgba(168, 85, 247, 0.8)', label: 'Digital' },
      { color: 'rgba(6, 182, 212, 0.8)', label: 'Compute' },
      { color: 'rgba(34, 197, 94, 0.8)', label: 'Hardware' },
    ];

    legends.forEach((leg, i) => {
      ctx.fillStyle = leg.color;
      ctx.beginPath();
      ctx.arc(legendX + 12, legendY + 35 + i * 15, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.font = '10px monospace';
      ctx.fillText(leg.label, legendX + 20, legendY + 39 + i * 15);
    });
  }, [listings, userLocation, radiusMiles]);

  return (
    <div className="w-full mb-6">
      <h3 className="text-white font-semibold mb-2">📍 Global Marketplace Map</h3>
      <div className="relative rounded-lg overflow-hidden border border-white/10 glass-dark">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full"
          onMouseMove={(e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            let label = null;
            listings.forEach((listing) => {
              if (listing.location) {
                const mercator = (lat: number, lng: number) => {
                  const width = canvas.width;
                  const height = canvas.height;
                  const px = ((lng + 180) / 360) * width;
                  const py = ((90 - lat) / 180) * height;
                  return { x: px, y: py };
                };
                const pos = mercator(listing.location.lat, listing.location.lng);
                const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                if (dist < 8) {
                  label = listing.name;
                }
              }
            });
            setHoveredLabel(label);
          }}
          onMouseLeave={() => setHoveredLabel(null)}
        />
        {hoveredLabel && (
          <div className="absolute bottom-4 left-4 px-3 py-2 bg-purple-500/90 rounded text-white text-xs pointer-events-none">
            {hoveredLabel}
          </div>
        )}
      </div>
    </div>
  );
}
