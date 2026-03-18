'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

interface CodePreviewProps {
  code: string;
  language?: string;
}

export default function CodePreview({ code, language }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');
  const displayLines = lines.slice(0, 5);

  const highlightCode = (line: string) => {
    // Simple syntax highlighting
    let highlighted = line;

    // Keywords in purple
    highlighted = highlighted.replace(
      /\b(const|function|return|import|from|async|await|class|if|else|for|while)\b/g,
      '<span class="text-purple-600">$1</span>'
    );

    // Strings in green
    highlighted = highlighted.replace(
      /'([^']*)'/g,
      '<span class="text-green-600">\'$1\'</span>'
    );
    highlighted = highlighted.replace(
      /"([^"]*)"/g,
      '<span class="text-green-600">"$1"</span>'
    );

    // Comments in gray
    highlighted = highlighted.replace(
      /\/\/(.*)$/g,
      '<span class="text-gray-500">// $1</span>'
    );
    highlighted = highlighted.replace(
      /#(.*)$/g,
      '<span class="text-gray-500"># $1</span>'
    );

    return highlighted;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-slate-50 rounded border border-gray-200 overflow-hidden">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded bg-purple-100 border border-purple-300 text-purple-700 hover:text-purple-900 transition-colors z-10"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </motion.button>

      <div className="p-2 font-mono text-xs overflow-x-auto max-h-20 overflow-y-hidden">
        {displayLines.map((line, idx) => (
          <div key={idx} className="text-slate-700 whitespace-pre">
            <span className="text-gray-400 mr-2">{idx + 1}</span>
            <span
              dangerouslySetInnerHTML={{ __html: highlightCode(line) }}
            />
          </div>
        ))}
        {lines.length > 5 && (
          <div className="text-gray-500 text-xs italic">
            ... {lines.length - 5} more lines
          </div>
        )}
      </div>
    </div>
  );
}
