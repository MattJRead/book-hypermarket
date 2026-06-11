import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This command bans Next.js from pre-building this route
export const dynamic = 'force-dynamic';

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
    const { data: localBooks, error: localError } = await supabaseAdmin
      .from('books')
      .select('id, title, author, category, cover_image_url')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .limit(10);

    if (localBooks && localBooks.length > 0) {
      return NextResponse.json({ success: true, source: 'vault', books: localBooks });
    }

    // Strike the Google API with the VIP Badge
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const fetchUrl = apiKey 
      ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${apiKey}`
      : `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`;

    const googleRes = await fetch(fetchUrl);
    
    if (!googleRes.ok) {
       return NextResponse.json({ error: 'Google API blocked the request.' }, { status: 500 });
    }

    const googleData = await googleRes.json();

    if (!googleData.items || googleData.items.length === 0) {
      return NextResponse.json({ success: true, source: 'empty', books: [] });
    }

    const newBooks = googleData.items.map((item: any) => {
      const info = item.volumeInfo;
      const isbn13 = info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier || null;

      return {
        title: info.title || 'Unknown Title',
        author: info.authors ? info.authors.join(', ') : 'Unknown Author',
        category: info.categories ? info.categories[0] : 'General',
        isbn13: isbn13,
        cover_image_url: 'UNAVAILABLE' 
      };
    });

    const { data: insertedBooks, error: insertError } = await supabaseAdmin
      .from('books')
      .insert(newBooks)
      .select('id, title, author, category, cover_image_url');

    if (insertError) {
      return NextResponse.json({ error: `Database blocked insertion` }, { status: 500 });
    }

    return NextResponse.json({ success: true, source: 'google_ingested', books: insertedBooks });

  } catch (error: any) {
    return NextResponse.json({ error: 'Search engine misfire.' }, { status: 500 });
  }
}