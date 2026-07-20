'use server';

import { supabase } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateReadingProgress(formData: FormData) {
  // 1. Extract the data
  const clubId = formData.get('clubId') as string;
  const format = formData.get('format') as string;
  const position = parseInt(formData.get('position') as string, 10);
  const total = parseInt(formData.get('total') as string, 10);

  // 2. Verify the user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('You must be signed in to update your progress.');
  }

  // 3. Update their specific row in the vault
  const { error } = await supabase
    .from('club_members')
    .update({
      reading_format: format,
      current_position: position,
      total_length: total
    })
    .eq('club_id', clubId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to update progress.');
  }

  // 4. Tell Next.js to instantly refresh the dashboard page to show the new bar width
  revalidatePath(`/club/${clubId}`);
}