import { supabase } from '../../../../lib/supabase';
import QuoteForm from './QuoteForm';
import StickyNote from './StickyNote';

export default async function QuotesPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // Fetch all quotes for this specific club, newest first
  const { data: quotes } = await supabase
    .from('club_quotes')
    .select('*')
    .eq('club_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="pb-12">
      {/* The Input Form */}
      <QuoteForm clubId={id} />

      {/* The Sticky Note Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {quotes?.map((quote) => (
          <StickyNote key={quote.id} quote={quote} />
        ))}
        
        {quotes?.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 italic">
            The board is empty. Be the first to pin a quote.
          </div>
        )}
      </div>
    </div>
  );
}