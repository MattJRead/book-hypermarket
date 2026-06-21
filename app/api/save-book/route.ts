import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Adjust this import path if your supabase client is located elsewhere (e.g., '../../../lib/supabase')

export async function POST(request: Request) {
  try {
    const book = await request.json();

    // 1. Validate the payload
    if (!book || !book.isbn13) {
      return NextResponse.json({ error: 'Missing book data or ISBN' }, { status: 400 });
    }

    // 2. Check if the book already exists in the vault (using ISBN to prevent duplicates)
    const { data: existingBook, error: searchError } = await supabase
      .from('books')
      .select('id')
      .eq('isbn13', book.isbn13)
      .single();

    if (existingBook) {
      // The book is already in the vault. Return its official UUID.
      return NextResponse.json({ id: existingBook.id });
    }

   // 3. If it doesn't exist, we forge a brand new entry in the books table
    const { data: newBook, error: insertError } = await supabase
      .from('books')
      .insert([{
        title: book.title,
        author: book.author,
        isbn13: book.isbn13,
        category: book.category || 'General',
        cover_image_url: book.cover_image_url || 'UNAVAILABLE'
        // The 'format' line has been completely removed!
      }])
      .select('id')
      .single();

    if (insertError) {
      console.error('[Save Book] Insert Error:', insertError);
      return NextResponse.json({ error: 'Failed to insert book into vault' }, { status: 500 });
    }

    // 4. Return the freshly minted UUID to the BookCard
    return NextResponse.json({ id: newBook.id });

  } catch (error) {
    console.error('[Save Book] Critical Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}