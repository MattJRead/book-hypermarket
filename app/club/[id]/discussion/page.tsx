import { supabase } from '../../../../lib/supabase';
import DiscussionForm from './DiscussionForm';
import DiscussionThread from './DiscussionThread';

export default async function DiscussionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // Fetch all reviews for this specific club, newest first
  const { data: reviews } = await supabase
    .from('chapter_reviews')
    .select('*')
    .eq('club_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="pb-12 max-w-3xl mx-auto">
      {/* The Input Form */}
      <DiscussionForm clubId={id} />

      {/* The Discussion Feed */}
      <div className="space-y-2">
        {reviews?.map((review) => (
          <DiscussionThread key={review.id} review={review} />
        ))}
        
        {reviews?.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic bg-gray-800/50 rounded-lg border border-gray-700 border-dashed">
            No discussions yet. Be the first to review a chapter.
          </div>
        )}
      </div>
    </div>
  );
}