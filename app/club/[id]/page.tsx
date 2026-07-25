'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function ClubDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); 
  const [club, setClub] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // New states for our dynamic data
  const [bookTitle, setBookTitle] = useState('Resolving title...');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    async function fetchClubDetails() {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single();
        
      if (data) {
        setClub(data);
        calculateCountdown(data.target_finish_date);
        fetchBookData(data.current_book_isbn);
      }
      setIsLoading(false);
    }
    
    fetchClubDetails();
  }, [id]);

  // The Time-Math Engine
  function calculateCountdown(targetDateString: string) {
    const target = new Date(targetDateString);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      setCountdown(`${diffDays} Days Remaining`);
    } else if (diffDays === 0) {
      setCountdown('Deadline is Today!');
    } else {
      setCountdown(`Finished ${Math.abs(diffDays)} Days Ago`);
    }
  }

  // The Google Books API Fetcher
  async function fetchBookData(isbn: string) {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setBookTitle(data.items[0].volumeInfo.title);
      } else {
        setBookTitle('Unknown Title (Check ISBN)');
      }
    } catch (error) {
      setBookTitle('Failed to load title from global network');
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-20 mt-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold">Loading Dashboard...</p>
      </div>
    );
  }

  if (!club) return null; // Error handled by layout

  return (
    <div className="relative mt-4">
      {/* Invite ID Banner */}
      <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-lg mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Club Details</h2>
          <p className="text-gray-400 text-sm">Share this ID to invite others to your network.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invite ID:</span>
          <code className="bg-gray-900 text-blue-400 px-4 py-2 rounded border border-gray-700 text-sm font-mono shadow-inner">
            {club.id}
          </code>
        </div>
      </div>
      
      {/* Current Book Module */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 col-span-1 md:col-span-2 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative progress bar background */}
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-full opacity-50"></div>
          
          <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2 flex justify-between items-end">
            Current Read
            <span className="text-sm text-sky-400 font-mono bg-sky-900/30 px-2 py-1 rounded">{countdown}</span>
          </h2>
          
          <h3 className="text-3xl font-black text-white mb-1">{bookTitle}</h3>
          <p className="text-gray-400 text-sm font-mono mb-4">ISBN: {club.current_book_isbn}</p>
          
          <p className="text-gray-300 text-sm">
            <strong>Target Finish Date:</strong> {new Date(club.target_finish_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 col-span-1 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Network Roster</h2>
          <p className="text-gray-400 text-sm">More members will appear here as they join.</p>
        </div>
      </div>
    </div>
  );
}