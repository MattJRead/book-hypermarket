'use server';

import { supabase } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';

export async function castVote(formData: FormData) {
  const clubId = formData.get('clubId') as string;
  const pollId = formData.get('pollId') as string;
  const optionId = formData.get('optionId') as string;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('You must be signed in to vote.');
  }

  // Attempt to insert the vote. 
  // If they already voted, the Supabase Primary Key (poll_id, user_id) will instantly block this.
  const { error } = await supabase
    .from('poll_votes')
    .insert({
      poll_id: pollId,
      user_id: user.id,
      option_id: optionId
    });

  if (error) {
    throw new Error('You have already voted in this poll.');
  }

  // Instantly refresh the dashboard so they see the updated vote count
  revalidatePath(`/club/${clubId}`);
}