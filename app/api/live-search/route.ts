import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This command bans Next.js from pre-building this route
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'No search query provided.' }, { status: 400 });
  }

  try {
    console.log(`[LIVE SEARCH] Greedy protocol initiated for: "${query}"`);

    // 1. Strike the Google API FIRST
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const fetchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${apiKey}`;
    
    const googleRes = await fetch(fetchUrl);
    
    if (googleRes.ok) {
      const googleData = await googleRes.json();
      
      if (googleData.items && googleData.items.length > 0) {
        const newBooks = googleData.items.map((item: any) => ({
          title: item.volumeInfo.title || 'Unknown Title',
          author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
          category: item.volumeInfo.categories ? item.volumeInfo.categories[0] : 'General',
          isbn13: item.volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier || null,
          cover_image_url: 'UNAVAILABLE'
        }));

        // Upsert to database (Update if title exists, Insert if new)
        await supabaseAdmin
          .from('books')
          .upsert(newBooks, { onConflict: 'title' });
        
        console.log(`[LIVE SEARCH] Injected ${newBooks.length} books into vault.`);
      }
    }

    // 2. Fetch the combined local list (New + Old)
    const { data: finalBooks, error: fetchError } = await supabaseAdmin
      .from('books')
      .select('id, title, author, category, cover_image_url')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .limit(15);

    if (fetchError) throw fetchError;

    return NextResponse.json({ success: true, source: 'combined', books: finalBooks });

  } catch (error: any) {
    console.error('[LIVE SEARCH] Catastrophic Misfire:', error.message);
    return NextResponse.json({ error: 'Search engine misfire.' }, { status: 500 });
  }
}