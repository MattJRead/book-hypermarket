'use server';

import { supabase } from '../../lib/supabase';
import { redirect } from 'next/navigation';

export async function createBookClub(formData: FormData) {
  
  // Extract data from the form
  const clubName = formData.get('clubName') as string;
  const bookIsbn = formData.get('bookIsbn') as string;
  const targetDate = formData.get('targetDate') as string;
  
  // 1. Verify the user is securely logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('You must be signed in to forge a club.');
  }

  // 2. Forge the club in the vault and return the new Unique ID
  const { data: newClub, error: clubError } = await supabase
    .from('clubs')
    .insert({
      name: clubName,
      creator_id: user.id,
      current_book_isbn: bookIsbn,
      target_finish_date: targetDate
    })
    .select('id')
    .single();

  if (clubError || !newClub) {
    throw new Error('Failed to create the club.');
  }

  // 3. Automatically add the creator to the club roster
  const { error: memberError } = await supabase
    .from('club_members')
    .insert({
      club_id: newClub.id,
      user_id: user.id,
      reading_format: 'Physical',
      current_position: 0,
      total_length: 100 
    });

  if (memberError) {
    throw new Error('Failed to add you to the club roster.');
  }

  // 4. Instantly route the creator to their new club dashboard
  redirect(`/club/${newClub.id}`);
}

export async function joinClubById(formData: FormData) {
  const clubId = formData.get('clubId') as string;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('You must be signed in to join a club.');
  }

  // 1. Verify the club actually exists
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('id')
    .eq('id', clubId)
    .single();

  if (clubError || !club) {
    throw new Error('Invalid Club ID. Please check the code and try again.');
  }

  // 2. Add the user to the club (Supabase will block duplicates based on our Primary Key rule)
  const { error: joinError } = await supabase
    .from('club_members')
    .insert({
      club_id: club.id,
      user_id: user.id,
      reading_format: 'Physical',
      current_position: 0,
      total_length: 100
    });

  if (joinError) {
    // If they are already in the club, just route them there anyway
    redirect(`/club/${club.id}`);
  }

  // 3. Route them to their new dashboard
  redirect(`/club/${club.id}`);
}
