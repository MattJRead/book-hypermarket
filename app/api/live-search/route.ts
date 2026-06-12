import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
// Vercel Pro allows up to 300 seconds. We give it 60s to comfortably pull 40 books.
export const maxDuration = 60; 

export async function GET(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ error: 'No query provided.' }, { status: 400 });

  try {
    // 1. Strike Google for 10 Books (The Maximum Yield)
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const fetchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${apiKey}`;
    
    const googleRes = await fetch(fetchUrl);
    const googleData = await googleRes.json();

    if (googleData.items && googleData.items.length > 0) {
      const newBooks = googleData.items.map((item: any) => ({
        title: item.volumeInfo.title || 'Unknown',
        author: item.volumeInfo.authors?.join(', ') || 'Unknown',
        category: item.volumeInfo.categories?.[0] || 'General',
        isbn13: item.volumeInfo.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier || null,
        cover_image_url: item.volumeInfo.imageLinks?.thumbnail || 'UNAVAILABLE'
      }));

      // 2. The Duplicate Scanner (Prevents Vault Crashes)
      const titles = newBooks.map((b: any) => b.title);
      const { data: existingBooks } = await supabaseAdmin
        .from('books')
        .select('title')
        .in('title', titles);
      
      const existingTitles = existingBooks?.map(e => e.title) || [];
      const safeBooksToInsert = newBooks.filter((b: any) => !existingTitles.includes(b.title));

      // 3. Inject only the brand new books
      if (safeBooksToInsert.length > 0) {
        await supabaseAdmin.from('books').insert(safeBooksToInsert);
      }
    }

    // 4. Fetch the final 10 results from your vault
    const { data: finalBooks } = await supabaseAdmin
      .from('books')
      .select('id, title, author, category, cover_image_url, isbn13')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .limit(10 );

    return NextResponse.json({ success: true, books: finalBooks });

  } catch (error: any) {
    console.error('[CRITICAL ENGINE FAILURE]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}