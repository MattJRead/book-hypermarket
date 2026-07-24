'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function ClubDashboard({ params }: { params: { id: string } }) {
  const [club, setClub] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClubDetails() {
      // 1. Fetch the specific club data using the ID in the URL
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', params.id)
        .single();
        
      if (data) {
        setClub(data);
      }
      setIsLoading(false);
    }
    
    fetchClubDetails();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="text-center py-20 mt-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold">Loading Dashboard...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-20 mt-12">
        <h1 className="text-3xl font-bold text-white mb-4">404 - Club Not Found</h1>
        <p className="text-gray-400 mb-6">The vault could not locate this reading network.</p>
        <Link href="/club" className="bg-blue-600 px-6 py-2 rounded text-white font-bold transition hover:bg-blue-500">Return to Hub</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 mt-8 relative">
      <Link href="/club" className="text-sm text-blue-400 hover:text-blue-300 font-bold mb-8 inline-block transition-colors">
        ← Back to Hub
      </Link>
      
      {/* Cinematic Banner */}
      <div className="bg-gray-800 p-8 md:p-12 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{club.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invite ID:</span>
            <code className="bg-gray-900 text-blue-400 px-3 py-1 rounded border border-gray-700 text-sm">{club.id}</code>
          </div>
        </div>
      </div>
      
      {/* Current Book Module */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 col-span-1 md:col-span-2 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Current Read</h2>
          <p className="text-gray-300 mb-2"><strong>ISBN:</strong> {club.current_book_isbn}</p>
          <p className="text-gray-300"><strong>Target Finish:</strong> {club.target_finish_date}</p>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 col-span-1 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Network Roster</h2>
          <p className="text-gray-400 text-sm">More members will appear here as they join.</p>
        </div>
      </div>
    </div>
  );
}