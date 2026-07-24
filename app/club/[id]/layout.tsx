'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function ClubLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  // Use React's hook to unwrap the Next.js 15 params promise
  const { id } = use(params);
  const [club, setClub] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClubDetails() {
      // Fetch the club details using the securely authenticated client
      const { data } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setClub(data);
      }
      setIsLoading(false);
    }
    
    fetchClubDetails();
  }, [id]);

  // Clean loading state while checking the vault
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
         <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If the club truly doesn't exist, show our custom error instead of a system crash
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

  // Replace this later with your actual book cover fetch logic
  const cinematicBackgroundUrl = `https://your-image-source.com/${club.current_book_isbn}.jpg`;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      
      {/* The Cinematic Blurred Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 blur-2xl"
        style={{ backgroundImage: `url('${cinematicBackgroundUrl}')`, backgroundColor: '#1f2937' }}
      />
      
      {/* The Main Content Wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto p-6 mt-8">
        <header className="mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{club.name}</h1>
          
          {/* The Internal Tab Navigation */}
          <nav className="flex space-x-6 text-sm font-medium">
            <Link href={`/club/${id}`} className="text-blue-400 hover:text-blue-300">
              Dashboard
            </Link>
            <Link href={`/club/${id}/discussion`} className="text-gray-400 hover:text-white transition">
              Discussion
            </Link>
            <Link href={`/club/${id}/quotes`} className="text-gray-400 hover:text-white transition">
              Quote Board
            </Link>
            <Link href={`/club/${id}/settings`} className="text-gray-400 hover:text-white transition">
              Settings
            </Link>
          </nav>
        </header>

        {/* The specific tabs (Dashboard, Quotes, etc) will render exactly here */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}