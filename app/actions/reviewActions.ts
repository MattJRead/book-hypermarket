'use server';

import { supabase } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';

export async function addReview(formData: FormData) {
  const clubId = formData.get('clubId') as string;
  const chapter = parseInt(formData.get('chapter') as string, 10);
  const reviewText = formData.get('reviewText') as string;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('You must be signed in to post a review.');
  }

  const { error } = await supabase
    .from('chapter_reviews')
    .insert({
      club_id: clubId,
      user_id: user.id,
      chapter: chapter,
      review_text: reviewText
    });

  if (error) throw new Error('Failed to post review.');

  // Instantly refresh the discussion board
  revalidatePath(`/club/${clubId}/discussion`);
}