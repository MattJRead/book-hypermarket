'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { createBookClub } from '../../actions/clubActions';
import Link from 'next/link';

export default function CreateClubPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyAccess() {
      // Fetch the user session directly from the browser's memory
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
      }
      setIsLoading(false);
    }
    
    verifyAccess();
  }, []);

  // Show a cinematic loading spinner while checking the vault
  if (isLoading) {
    return (
      <div className="text-center py-12 mt-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold">Verifying Credentials...</p>
      </div>
    );
  }

  // If no user is found in the browser memory, deny access
  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6 mt-12 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-6">You must be logged in to forge a club.</p>
        <Link href="/login" className="bg-blue-600 px-6 py-2 rounded text-white font-bold transition-colors hover:bg-blue-500">Sign In</Link>
      </div>
    );
  }

  // The actual Forge Form for authenticated users
  return (
    <div className="max-w-xl mx-auto p-6 mt-12">
      <Link href="/club" className="text-sm text-blue-400 hover:text-blue-300 font-bold mb-6 inline-block transition-colors">
        ← Back to Hub
      </Link>
      
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl relative overflow-hidden">
        {/* Cinematic Header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Forge a New Club</h1>
        <p className="text-gray-400 mb-8 text-sm">Create a private space for your reading network. You will receive an invite ID immediately after creation.</p>
        
        <form action={createBookClub} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Club Name</label>
            <input 
              type="text" 
              name="clubName" 
              required 
              placeholder="e.g. The Midnight Readers"
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Starting Book ISBN</label>
            <input 
              type="text" 
              name="bookIsbn" 
              required 
              placeholder="Enter the 13-digit ISBN"
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Target Finish Date</label>
            <input 
              type="date" 
              name="targetDate" 
              required 
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition [color-scheme:dark]"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-md transition shadow-lg mt-6"
          >
            Launch Club
          </button>
        </form>
      </div>
    </div>
  );
}