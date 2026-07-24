'use client';

import { useState } from 'react';

export default function CopyInviteButton({ clubId }: { clubId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(clubId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset the button text after 2 seconds
  };

  return (
    <button 
      onClick={(e) => {
        e.preventDefault(); // Prevents clicking the button from triggering the Link wrapper
        handleCopy();
      }}
      className={`mt-4 w-full py-2 px-3 rounded text-xs font-bold uppercase tracking-wider transition-colors border ${
        copied 
          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50' 
          : 'bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {copied ? '✓ ID Copied to Clipboard' : 'Copy Invite ID'}
    </button>
  );
}