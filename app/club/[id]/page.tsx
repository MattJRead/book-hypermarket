'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams } from 'next/navigation';

export default function ClubDashboard() {
  const params = useParams();
  const id = params?.id as string;
  
  const [club, setClub] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [bookTitle, setBookTitle] = useState('Resolving title...');
  const [bookCover, setBookCover] = useState<string | null>(null); // New Cover State
  const [countdown, setCountdown] = useState('');
  const [dateLabel, setDateLabel] = useState('');

  useEffect(() => {
    async function fetchClubDetails() {
      const { data } = await supabase.from('clubs').select('*').eq('id', id).single();
      if (data) {
        setClub(data);
        calculateTimeLogic(data);
        if (data.current_book_isbn) fetchBookData(data.current_book_isbn);
      }
      setIsLoading(false);
    }
    if (id) fetchClubDetails();
  }, [id]);

  // Unified Time-Math Engine for Start or Finish Dates
  function calculateTimeLogic(clubData: any) {
    const today = new Date().getTime();
    
    if (clubData.target_finish_date) {
      setDateLabel('Target Finish');
      const target = new Date(clubData.target_finish_date).getTime();
      const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
      setCountdown(diffDays > 0 ? `${diffDays} Days Remaining` : diffDays === 0 ? 'Deadline is Today!' : `Finished ${Math.abs(diffDays)} Days Ago`);
    } 
    else if (clubData.start_date) {
      setDateLabel('Start Date');
      const start = new Date(clubData.start_date).getTime();
      const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
      setCountdown(diffDays > 0 ? `Starts in ${diffDays} Days` : diffDays === 0 ? 'Starts Today!' : `Started ${Math.abs(diffDays)} Days Ago`);
    } else {
      setDateLabel('Reading Timeline');
      setCountdown('Open Schedule');
    }
  }

  async function fetchBookData(isbn: string) {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${isbn}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setBookTitle(data.items[0].volumeInfo.title);
        // Extract the cover image safely
        if (data.items[0].volumeInfo.imageLinks?.thumbnail) {
          setBookCover(data.items[0].volumeInfo.imageLinks.thumbnail.replace('http:', 'https:'));
        }
      } else {
        setBookTitle('Unknown Title (Check ISBN)');
      }
    } catch (error) {
      setBookTitle('Failed to load title from global network');
    }
  }

  if (isLoading) return null; // Let the layout handle the loading spinner
  if (!club) return null; 

  return (
    <div className="relative mt-4">
      <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-lg mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Club Details</h2>
          <p className="text-gray-400 text-sm">Share this ID to invite others to your network.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invite ID:</span>
          <code className="bg-gray-900 text-blue-400 px-4 py-2 rounded border border-gray-700 text-sm font-mono shadow-inner">{club.id}</code>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CENTER-STACKED CURRENT READ MODULE */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 col-span-1 md:col-span-2 backdrop-blur-sm relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-full opacity-50"></div>
          
          <div className="w-full flex justify-between items-end border-b border-gray-700 pb-2 mb-8">
            <h2 className="text-xl font-bold text-white">Current Read</h2>
            <span className="text-sm text-sky-400 font-mono bg-sky-900/30 px-2 py-1 rounded shadow-inner">{countdown}</span>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 w-full">
            {bookCover ? (
              <img src={bookCover} alt="Cover" className="w-32 md:w-48 h-auto rounded shadow-[0_0_20px_rgba(0,0,0,0.6)] border border-gray-600 object-cover mb-6 hover:scale-105 transition-transform" />
            ) : (
              <div className="w-32 md:w-48 h-48 md:h-72 bg-gray-900 rounded border border-gray-700 flex items-center justify-center shadow-lg mb-6">
                <span className="text-gray-600 font-bold text-xs uppercase text-center px-2">Cover Unavailable</span>
              </div>
            )}
            
            <h3 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight max-w-md">{bookTitle}</h3>
            <p className="text-gray-400 text-sm font-mono bg-gray-900/50 px-4 py-1.5 rounded-full border border-gray-700 shadow-inner mb-6">
              ISBN: {club.current_book_isbn || 'Not Set'}
            </p>
          </div>
          
          <div className="mt-4 w-full pt-4 border-t border-gray-700/50">
            <p className="text-gray-300 text-sm">
              <strong className="text-white">{dateLabel}:</strong> {club.target_finish_date || club.start_date ? new Date(club.target_finish_date || club.start_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Flexible Timeline'}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 col-span-1 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Network Roster</h2>
          <p className="text-gray-400 text-sm">More members will appear here as they join.</p>
        </div>
      </div>
    </div>
  );
}