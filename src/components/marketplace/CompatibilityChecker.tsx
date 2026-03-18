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
    if (!gpuModel || !vram || !ram || !framework) return;

    const userVram = Number(vram);
    const requiredVram = listing.techSpecs?.vram || 0;
    let result: CompatStatus = 'compatible';

    if (userVram < requiredVram * 0.8) result = 'incompatible';
    else if (userVram < requiredVram) result = 'warning';

    if (listing.techSpecs?.framework && !listing.techSpecs.framework.includes(framework)) {
      result = result === 'incompatible' ? 'incompatible' : 'warning';
    }
    setStatus(result);
  };

  return (
    <div className="w-full mb-6 glass-panel rounded-lg p-6 border border-purple-500/30">
      <h3 className="text-white font-semibold mb-4">✅ Will It Run?</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-300 block mb-1">GPU Model</label>
            <input type="text" placeholder="RTX 4090, A100, etc" value={gpuModel} onChange={(e) => setGpuModel(e.target.value)} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-300 block mb-1">VRAM (GB)</label>
            <input type="number" placeholder="24" value={vram} onChange={(e) => setVram(e.target.value)} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-300 block mb-1">System RAM (GB)</label>
            <input type="number" placeholder="64" value={ram} onChange={(e) => setRam(e.target.value)} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-300 block mb-1">Framework</label>
            <select value={framework} onChange={(e) => setFramework(e.target.value)} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50">
              <option value="">Select...</option>
              <option value="PyTorch">PyTorch</option>
              <option value="TensorFlow">TensorFlow</option>
              <option value="JAX">JAX</option>
              <option value="ONNX">ONNX</option>
            </select>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCheck} className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold text-sm">
          Check Compatibility
        </motion.button>
        {status && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-lg border flex items-center gap-3 ${status === 'compatible' ? 'bg-green-500/10 border-green-500/50' : status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
            {status === 'compatible' && (<><Check size={20} className="text-green-400" /><div className="text-sm"><p className="font-semibold text-green-200">✅ Compatible</p><p className="text-xs text-green-300">Should work great!</p></div></>)}
            {status === 'warning' && (<><AlertCircle size={20} className="text-yellow-400" /><div className="text-sm"><p className="font-semibold text-yellow-200">⚠️ May Need More VRAM</p><p className="text-xs text-yellow-300">Required: {listing.techSpecs?.vram}GB</p></div></>)}
            {status === 'incompatible' && (<><X size={20} className="text-red-400" /><div className="text-sm"><p className="font-semibold text-red-200">❌ Incompatible</p><p className="text-xs text-red-300">Insufficient VRAM or framework mismatch</p></div></>)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
