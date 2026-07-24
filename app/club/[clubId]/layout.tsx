import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ClubLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>; // Updated to Promise
}) {
  // Await the params before extracting the ID
  const { id } = await params;

  // 1. Fetch the club details from the vault
  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single();

  if (!club) {
    notFound();
  }

  // 2. We will replace the placeholder URL below with your actual book cover fetch logic later
  const cinematicBackgroundUrl = `https://your-image-source.com/${club.current_book_isbn}.jpg`;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      
      {/* The Cinematic Blurred Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 blur-2xl"
        style={{ backgroundImage: `url('${cinematicBackgroundUrl}')` }}
      />
      
      {/* The Main Content Wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <header className="mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-4xl font-bold text-white mb-4">{club.name}</h1>
          
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