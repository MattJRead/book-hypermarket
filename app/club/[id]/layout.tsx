'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import FloatingMenu from '../../../components/FloatingMenu';

export default function ClubLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params?.id as string;
  const pathname = usePathname(); 
  
  const [club, setClub] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActivePoll, setHasActivePoll] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchClubDetails() {
      const { data } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single();

      if (data) setClub(data);
      setIsLoading(false);
    }

    async function checkPollStatus() {
      const { count } = await supabase
        .from('polls') 
        .select('*', { count: 'exact', head: true })
        .eq('club_id', id)
        .eq('is_active', true);
        
      if (count && count > 0) setHasActivePoll(true);
    }
    
    fetchClubDetails();
    checkPollStatus();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
         <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-3xl font-bold text-white mb-4">404 - Club Not Found</h1>
        <p className="text-gray-400 mb-6">The vault could not locate this reading network.</p>
        <Link href="/club" className="bg-blue-600 px-6 py-2 rounded text-white font-bold transition hover:bg-blue-500">
          Return to Hub
        </Link>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 blur-2xl"
        style={{ backgroundColor: '#1f2937' }}
      />
      
      <div className="relative z-10 max-w-5xl mx-auto p-6 mt-8">
        <header className="mb-8 border-b border-gray-700">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{club.name}</h1>
          
          <nav className="flex space-x-6 text-sm">
            <Link 
              href={`/club/${id}`} 
              className={`pb-4 transition-colors font-bold ${isActive(`/club/${id}`) ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              Dashboard
            </Link>
            <Link 
              href={`/club/${id}/discussion`} 
              className={`pb-4 transition-colors font-bold ${isActive(`/club/${id}/discussion`) ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              Discussion
            </Link>
            <Link 
              href={`/club/${id}/quotes`} 
              className={`pb-4 transition-colors font-bold ${isActive(`/club/${id}/quotes`) ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              Quote Board
            </Link>
            <Link 
              href={`/club/${id}/polls`} 
              className={`relative pb-4 transition-colors font-bold ${isActive(`/club/${id}/polls`) ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              Polls
              {hasActivePoll && (
                <span className="absolute top-0 -right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              )}
            </Link>
            <Link 
              href={`/club/${id}/settings`} 
              className={`pb-4 transition-colors font-bold ${isActive(`/club/${id}/settings`) ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              Settings
            </Link>
          </nav>
        </header>

        <main>
          {children}
        </main>
      </div>

      {/* Global Navigation - Rendered correctly at the root of the layout */}
      <FloatingMenu />
      
    </div>
  );
}