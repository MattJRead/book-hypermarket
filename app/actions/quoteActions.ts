'use server';

import { supabase } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';

export async function addQuote(formData: FormData) {
  const clubId = formData.get('clubId') as string;
  const chapter = parseInt(formData.get('chapter') as string, 10);
  const quoteText = formData.get('quoteText') as string;
  const attribution = formData.get('attribution') as string;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('You must be signed in to post a quote.');
  }

  const { error } = await supabase
    .from('club_quotes')
    .insert({
      club_id: clubId,
      user_id: user.id,
      chapter: chapter,
      quote_text: quoteText,
      character_attribution: attribution || null
    });

  if (error) throw new Error('Failed to post quote.');

  // Instantly refresh the quotes board
  revalidatePath(`/club/${clubId}/quotes`);
}