'use client';

import { use } from 'react';

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-lg mt-4 backdrop-blur-md">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Club Settings</h2>
      <p className="text-gray-400">Settings module for club <span className="font-mono text-blue-400">{id}</span> is under construction.</p>
      
      {/* We will build out the ability to change the current book, kick members, or delete the club here */}
    </div>
  );
}