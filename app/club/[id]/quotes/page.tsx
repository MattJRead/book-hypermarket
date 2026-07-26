'use client';

import { supabase } from '../../../../lib/supabase';
import QuoteForm from './QuoteForm';
import StickyNote from './StickyNote';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function QuotesPage() {
  const params = useParams();
  const router = useRouter(); 
  const id = params?.id as string;
  
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Security States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clubAdminId, setClubAdminId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Identify the logged-in user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setCurrentUser(session.user);
    });
  }, []);

  const fetchQuotes = async () => {
    // Check the creator_id column to grant admin rights
    const { data: club } = await supabase.from('clubs').select('*').eq('id', id).single();
    if (club) {
      setClubAdminId(club.creator_id); // <-- Aligned with your database
    }

    const { data } = await supabase
      .from('club_quotes')
      .select('*')
      .eq('club_id', id)
      .order('created_at', { ascending: false });

    if (data) setQuotes(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) fetchQuotes();
  }, [id]);

  const handleDelete = async (quoteId: string) => {
    if (!confirm("Are you sure you want to tear this note off the board?")) return;
    
    const { error } = await supabase.from('club_quotes').delete().eq('id', quoteId);
    
    if (error) {
      console.error("Vault Rejection:", error);
      alert("The database blocked this deletion. You may not have permission.");
    } else {
      fetchQuotes();
      router.refresh(); 
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 mt-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold">Loading Quote Board...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 mt-4 relative">
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <QuoteForm 
              clubId={id} 
              onSuccess={() => {
                setIsModalOpen(false);
                fetchQuotes(); 
                router.refresh(); 
              }} 
              onCancel={() => setIsModalOpen(false)} 
            />
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-widest border-b border-gray-700 pb-4 inline-block">
          Favorite Quotes
        </h2>
        <div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded shadow-[0_0_15px_rgba(37,99,235,0.5)] transition hover:scale-105"
          >
            + Write a Note
          </button>
        </div>
      </div>

      <div className="bg-amber-900 p-6 md:p-10 rounded-xl shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] min-h-[500px] border-[14px] border-[#4a2e15] relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
          
          {quotes.length === 0 ? (
            <div className="col-span-full text-center py-20 text-white/50 font-bold text-lg font-[cursive] tracking-wider">
              The board is empty. Pin the first page flag.
            </div>
          ) : (
            quotes.map((quote, index) => {
              // The precise logic determining if the trash can should be rendered
              const isNoteOwner = currentUser?.id === quote.user_id;
              const isClubAdmin = currentUser?.id === clubAdminId;
              const canDelete = isNoteOwner || isClubAdmin;

              return (
                <StickyNote 
                  key={quote.id} 
                  quote={quote} 
                  index={index} 
                  canDelete={canDelete}
                  onDelete={() => handleDelete(quote.id)} 
                />
              );
            })
          )}
          
        </div>
      </div>
      
    </div>
  );
}