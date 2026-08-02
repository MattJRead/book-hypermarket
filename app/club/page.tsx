'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import FloatingMenu from '../../components/FloatingMenu';

export default function BookClubHub() {
  const [user, setUser] = useState<any>(null);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevents the link from triggering
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
    const { data: memberLinks } = await supabase.from('club_members').select('club_id').eq('user_id', userId);
    const rosterClubIds = memberLinks ? memberLinks.map(link => link.club_id) : [];

    const { data: ownedClubs } = await supabase.from('clubs').select('id').eq('creator_id', userId);
    const ownedClubIds = ownedClubs ? ownedClubs.map(c => c.id) : [];

    const allUniqueIds = Array.from(new Set([...rosterClubIds, ...ownedClubIds]));

    if (allUniqueIds.length > 0) {
      const { data: finalClubs } = await supabase.from('clubs').select('*').in('id', allUniqueIds).order('created_at', { ascending: false });
      if (finalClubs) setMyClubs(finalClubs);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto mt-8">
        
        {/* CENTERED LOGO */}
        <div className="flex justify-center mb-16">
          <Link href="/club" className="group flex items-baseline cursor-pointer">
            <span className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
              book
            </span>
            <span className="text-4xl md:text-5xl font-black italic text-[#00bfff] tracking-tighter relative mx-2 group-hover:scale-105 transition-transform">
              Club
              {/* The signature horizontal cutout slice */}
              <span className="absolute top-[55%] left-[-5%] w-[110%] h-[3px] bg-[#0f172a] -translate-y-1/2 pointer-events-none"></span>
            </span>
            <span className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
              Hub
            </span>
          </Link>
        </div>

        {/* HEADER CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-gray-800/40 p-6 md:p-8 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black mb-2">My Networks</h1>
            <p className="text-gray-400">Access your private reading clubs and discussions.</p>
          </div>
          <Link href="/club/create" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1">
            + Forge New Club
          </Link>
        </div>

        {/* CLUBS GRID */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !user ? (
          <div className="text-center py-20 bg-gray-800/40 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">You must be logged in.</h2>
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold bg-blue-900/30 px-6 py-2 rounded-full transition-colors">Go to Login →</Link>
          </div>
        ) : myClubs.length === 0 ? (
          <div className="text-center py-24 bg-gray-800/40 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
            <div className="text-5xl mb-4 opacity-50">📚</div>
            <h2 className="text-2xl font-bold text-white mb-2">No active networks found.</h2>
            <p className="text-gray-400">Forge a new club or use an Invite ID to join an existing one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClubs.map(club => (
              <Link key={club.id} href={`/club/${club.id}`} className="bg-gray-800/50 border border-gray-700/60 hover:border-blue-500/50 p-7 rounded-3xl shadow-lg transition-all hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden flex flex-col h-full">
                
                {/* Accent Top Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-sky-400 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors leading-tight">{club.name}</h3>
                
                <div className="mt-auto space-y-4">
                  <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Invite ID</p>
                    <p className="text-sm text-blue-400 font-mono">{club.id.substring(0,12)}...</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-lg">📖</span> 
                    <span className="truncate">ISBN: {club.current_book_isbn || 'Unknown'}</span>
                  </div>
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