import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Tell Vercel to give us 30s instead of the default 10s

export async function GET(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 });

  try {
    // 1. Check local vault
    const { data: localBooks } = await supabaseAdmin
      .from('books')
      .select('id, title, author, category, cover_image_url')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .limit(10);

    if (localBooks && localBooks.length > 0) {
      return NextResponse.json({ success: true, source: 'vault', books: localBooks });
    }

    // 2. Fetch from Google (Limit to 10 for stability)
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const fetchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${apiKey}`;
    
    const googleRes = await fetch(fetchUrl);
    if (!googleRes.ok) throw new Error('Google API Failed');

    const googleData = await googleRes.json();
    if (!googleData.items) return NextResponse.json({ success: true, source: 'empty', books: [] });

    // 3. Process & Insert
    const newBooks = googleData.items.map((item: any) => ({
      title: item.volumeInfo.title || 'Unknown',
      author: item.volumeInfo.authors?.join(', ') || 'Unknown',
      category: item.volumeInfo.categories?.[0] || 'General',
      isbn13: item.volumeInfo.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier || null,
      cover_image_url: 'UNAVAILABLE'
    }));

    await supabaseAdmin.from('books').insert(newBooks);
    
    return NextResponse.json({ success: true, source: 'google_ingested', books: newBooks });

  } catch (error: any) {
    console.error('[CRITICAL]', error.message); // This will now show in your logs!
    return NextResponse.json({ error: 'Engine Misfire' }, { status: 500 });
  }
}