'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import FloatingMenu from '../../components/FloatingMenu';

export default function BookClubHub() {
  const [user, setUser] = useState<any>(null);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchMyNetworks(session.user.id);
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  const fetchMyNetworks = async (userId: string) => {
    // 1. Find clubs where the user is explicitly on the roster
    const { data: memberLinks } = await supabase.from('club_members').select('club_id').eq('user_id', userId);
    const rosterClubIds = memberLinks ? memberLinks.map(link => link.club_id) : [];

    // 2. Find clubs the user created (Rescues "test 1")
    const { data: ownedClubs } = await supabase.from('clubs').select('id').eq('creator_id', userId);
    const ownedClubIds = ownedClubs ? ownedClubs.map(c => c.id) : [];

    // 3. Combine them and remove duplicates
    const allUniqueIds = Array.from(new Set([...rosterClubIds, ...ownedClubIds]));

    if (allUniqueIds.length > 0) {
      const { data: finalClubs } = await supabase.from('clubs').select('*').in('id', allUniqueIds).order('created_at', { ascending: false });
      if (finalClubs) setMyClubs(finalClubs);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 relative overflow-hidden">
      
      <div className="relative z-10 max-w-5xl mx-auto mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">My Networks</h1>
            <p className="text-gray-400">Access your private reading clubs and discussions.</p>
          </div>
          <Link href="/club/create" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
            + Forge New Club
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : !user ? (
          <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">You must be logged in.</h2>
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold">Go to Login →</Link>
          </div>
        ) : myClubs.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-2">No active networks found.</h2>
            <p className="text-gray-400">Forge a new club or use an Invite ID to join an existing one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClubs.map(club => (
              <Link key={club.id} href={`/club/${club.id}`} className="bg-gray-800/80 border border-gray-700 hover:border-blue-500 p-6 rounded-2xl shadow-lg transition-all hover:-translate-y-1 group">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{club.name}</h3>
                <p className="text-xs text-gray-500 font-mono mb-4 bg-gray-900 px-3 py-1 rounded inline-block">ID: {club.id.substring(0,8)}...</p>
                <div className="text-sm text-gray-400">
                  <span className="block mb-1">📖 ISBN: {club.current_book_isbn || 'Unknown'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <FloatingMenu />
    </div>
  );
}