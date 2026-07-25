'use client';

import { supabase } from '../../../../lib/supabase';
import QuoteForm from './QuoteForm';
import StickyNote from './StickyNote';
import { useEffect, useState, use } from 'react';

export default function QuotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotes() {
      const { data } = await supabase
        .from('club_quotes')
        .select('*')
        .eq('club_id', id)
        .order('created_at', { ascending: false });

      if (data) {
        setQuotes(data);
      }
      setIsLoading(false);
    }
    
    fetchQuotes();
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
    <div className="pb-12 mt-4">
      {/* The Input Form */}
      <QuoteForm clubId={id} />

      {/* The Sticky Note Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start mt-8">
        {quotes.map((quote) => (
          <StickyNote key={quote.id} quote={quote} />
        ))}
        
        {quotes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 italic bg-gray-800/50 rounded-lg border border-gray-700 border-dashed backdrop-blur-sm">
            The board is empty. Be the first to pin a quote.
          </div>
        )}
      </div>
    </div>
  );
}