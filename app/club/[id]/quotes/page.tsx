'use client';

import { supabase } from '../../../../lib/supabase';
import QuoteForm from './QuoteForm';
import StickyNote from './StickyNote';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function QuotesPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuotes = async () => {
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
      
      {/* The Popup Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <QuoteForm 
              clubId={id} 
              onSuccess={() => {
                setIsModalOpen(false);
                fetchQuotes(); // Instantly displays the new note
              }} 
              onCancel={() => setIsModalOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Centered Header & Button */}
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

      {/* The Corkboard Area */}
      <div className="bg-amber-900 p-6 md:p-10 rounded-xl shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] min-h-[500px] border-[14px] border-[#4a2e15] relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
          
          {quotes.length === 0 ? (
            <div className="col-span-full text-center py-20 text-white/50 font-bold text-lg font-[cursive] tracking-wider">
              The board is empty. Pin the first page flag.
            </div>
          ) : (
            quotes.map((quote, index) => (
              <StickyNote key={quote.id} quote={quote} index={index} />
            ))
          )}
          
        </div>
      </div>
      
    </div>
  );
}