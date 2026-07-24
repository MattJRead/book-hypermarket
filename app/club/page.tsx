'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { joinClubById } from '../actions/clubActions';
import CopyInviteButton from './CopyInviteButton';

export default function ClubHub() {
  const [user, setUser] = useState<any>(null);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHubData() {
      // 1. Fetch the user session directly from the browser's memory
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // 2. If they are logged in, fetch their specific clubs
        const { data } = await supabase
          .from('club_members')
          .select(`
            club_id,
            clubs (
              id,
              name,
              current_book_isbn
            )
          `)
          .eq('user_id', session.user.id);
          
        if (data) {
          setMyClubs(data.map((membership: any) => membership.clubs));
        }
      }
      // Stop the loading spinner once the vault is checked
      setIsLoading(false);
    }
    
    fetchHubData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 mt-8 relative">
      
      {/* 1. Centered Header with Persistent Create Button */}
      <div className="flex flex-col items-center justify-center mb-12 text-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Book <span className="text-sky-500 italic font-black tracking-tight">Club</span> Hub
          </h1>
          <p className="text-gray-400">Your private reading networks.</p>
        </div>
        
        <Link 
          href="/club/create" 
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-md transition shadow-lg shadow-blue-900/20 mt-2 inline-block"
        >
          + Create Club
        </Link>
      </div>

      {/* 2. Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-bold">Accessing the Vault...</p>
        </div>
      ) : (
        <>
          {/* 3. Centered Search Bar for Joining */}
          {user && (
            <div className="max-w-xl mx-auto mb-16 bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest text-center mb-4">Have an invite code?</h2>
              <form action={joinClubById} className="flex gap-2">
                <input 
                  type="text" 
                  name="clubId" 
                  required
                  placeholder="Paste Unique Club ID here..." 
                  className="flex-1 bg-gray-900 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono placeholder:font-sans"
                />
                <button 
                  type="submit" 
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md transition border border-gray-600"
                >
                  Join
                </button>
              </form>
            </div>
          )}

          {/* 4. The Clubs Grid */}
          <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">My Active Clubs</h2>
          
          {!user ? (
            <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
              <p className="text-gray-400 mb-4">Please sign in to view your clubs.</p>
              <Link href="/login" className="text-blue-400 font-bold hover:underline">Sign In to Continue</Link>
            </div>
          ) : myClubs.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800 border-dashed">
              <p className="text-gray-400">You haven't joined any clubs yet.</p>
              <p className="text-sm text-gray-500 mt-2">Paste an invite ID above, or create your own to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs.map((club) => (
                <Link 
                  key={club.id} 
                  href={`/club/${club.id}`}
                  className="block bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/20 transition group relative overflow-hidden"
                >
                  {/* Decorative gradient for the card */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition mb-2">{club.name}</h3>
                    <p className="text-xs text-gray-400 mb-4 font-mono">Book ISBN: {club.current_book_isbn}</p>
                    
                    {/* The new interactive copy button */}
                    <CopyInviteButton clubId={club.id} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}