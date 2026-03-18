'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationSearchProps {
  onLocationChange: (coords: { lat: number; lng: number; city: string } | null) => void;
  onRadiusChange: (miles: number) => void;
  radius: number;
}

export default function LocationSearch({
  onLocationChange,
  onRadiusChange,
  radius,
}: LocationSearchProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const handleUseLocation = () => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
        setCity(cityName);
        onLocationChange({ lat: latitude, lng: longitude, city: cityName });
        setLoading(false);
      },
      (err) => {
        setError('Could not get your location');
        setLoading(false);
      }
    );
  };

  return (
    <div className="w-full mb-6 glass-dark rounded-lg p-4 border border-white/10">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUseLocation}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MapPin size={16} />
            )}
            {loading ? 'Finding Location...' : 'Use My Location'}
          </motion.button>

          {city && (
            <div className="text-sm text-gray-300">
              📍 <span className="font-mono text-cyan-300">{city}</span>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-300 flex items-center gap-2 mb-2">
            <span>Search Radius</span>
            <span className="font-semibold text-cyan-300">{radius} miles</span>
          </label>
          <input
            type="range"
            min="0"
            max="500"
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-full cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Nearby</span>
            <span>Nationwide</span>
          </div>
        </div>
      </div>
    </div>
  );
}
