import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const book = await request.json();
    
    // Safety Net: Check if someone else just saved it milliseconds ago
    const { data: existing } = await supabaseAdmin.from('books').select('id').eq('isbn13', book.isbn13).single();
    if (existing) return NextResponse.json({ id: existing.id });

    // Save the book and return its new permanent ID
    const { data: newBook, error } = await supabaseAdmin.from('books').insert({
      title: book.title,
      author: book.author,
      isbn13: book.isbn13,
      category: book.category,
      cover_image_url: book.cover_image_url
    }).select('id').single();

    if (error) throw error;
    
    return NextResponse.json({ id: newBook.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}