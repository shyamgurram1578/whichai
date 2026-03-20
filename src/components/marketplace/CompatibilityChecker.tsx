'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, X } from 'lucide-react';
import { MarketListingV3 } from '@/lib/data';

interface CompatibilityCheckerProps {
  listing: MarketListingV3;
}

type CompatStatus = 'compatible' | 'warning' | 'incompatible' | null;

export default function CompatibilityChecker({ listing }: CompatibilityCheckerProps) {
  const [gpuModel, setGpuModel] = useState('');
  const [vram, setVram] = useState('');
  const [ram, setRam] = useState('');
  const [framework, setFramework] = useState('');
  const [status, setStatus] = useState<CompatStatus>(null);

  const handleCheck = () => {
    if (!gpuModel || !vram || !ram || !framework) {
      return;
    }

    const userVram = Number(vram);
    const requiredVram = listing.techSpecs?.vram || 0;

    let result: CompatStatus = 'compatible';

    if (userVram < requiredVram * 0.8) {
      result = 'incompatible';
    } else if (userVram < requiredVram) {
      result = 'warning';
    }

    if (
      listing.techSpecs?.framework &&
      !listing.techSpecs.framework.includes(framework)
    ) {
      result = result === 'incompatible' ? 'incompatible' : 'warning';
    }

    setStatus(result);
  };

  return (
    <div className="w-full mb-6 bg-white rounded-xl p-5 border border-purple-200 shadow-sm">
      <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2 text-sm">
        ✅ Will It Run?
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1 font-medium">GPU Model</label>
            <input
              type="text"
              placeholder="RTX 4090, A100, etc"
              value={gpuModel}
              onChange={(e) => setGpuModel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1 font-medium">VRAM (GB)</label>
            <input
              type="number"
              placeholder="24"
              value={vram}
              onChange={(e) => setVram(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1 font-medium">System RAM (GB)</label>
            <input
              type="number"
              placeholder="64"
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1 font-medium">Framework</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-slate-800 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
            >
              <option value="">Select...</option>
              <option value="PyTorch">PyTorch</option>
              <option value="TensorFlow">TensorFlow</option>
              <option value="JAX">JAX</option>
              <option value="ONNX">ONNX</option>
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheck}
          className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold text-sm hover:from-purple-600 hover:to-cyan-600 transition-all shadow-sm"
        >
          Check Compatibility
        </motion.button>

        {status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg border flex items-center gap-3 ${
              status === 'compatible'
                ? 'bg-green-50 border-green-200'
                : status === 'warning'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {status === 'compatible' && (
              <>
                <Check size={18} className="text-green-500 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-green-700">Compatible</p>
                  <p className="text-xs text-green-600">Should work great with your setup!</p>
                </div>
              </>
            )}
            {status === 'warning' && (
              <>
                <AlertCircle size={18} className="text-yellow-500 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-700">May Need More VRAM</p>
                  <p className="text-xs text-yellow-600">
                    Required: {listing.techSpecs?.vram}GB — performance may vary
                  </p>
                </div>
              </>
            )}
            {status === 'incompatible' && (
              <>
                <X size={18} className="text-red-500 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-red-700">Incompatible</p>
                  <p className="text-xs text-red-600">Insufficient VRAM or framework mismatch</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
