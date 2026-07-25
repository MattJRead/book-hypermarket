'use client';

import { supabase } from '../../../../lib/supabase';
import DiscussionForm from './DiscussionForm';
import DiscussionThread from './DiscussionThread';
import { useEffect, useState, use } from 'react';

export default function DiscussionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('chapter_reviews')
        .select('*')
        .eq('club_id', id)
        .order('created_at', { ascending: false });

      if (data) {
        setReviews(data);
      }
      setIsLoading(false);
    }
    
    fetchReviews();
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-12 mt-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold">Loading Discussions...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-3xl mx-auto mt-4">
      {/* The Input Form */}
      <DiscussionForm clubId={id} />

      {/* The Discussion Feed */}
      <div className="space-y-2 mt-8">
        {reviews.map((review) => (
          <DiscussionThread key={review.id} review={review} />
        ))}
        
        {reviews.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic bg-gray-800/50 rounded-lg border border-gray-700 border-dashed backdrop-blur-sm">
            No discussions yet. Be the first to review a chapter.
          </div>
        )}
      </div>
    </div>
  );
}