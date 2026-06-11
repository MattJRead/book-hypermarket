import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This command bans Next.js from pre-building this route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {

export async function GET(request: Request) {
  // 1. Initialize the Admin client INSIDE the function so the compiler ignores it during build
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
    console.log(`[LIVE SEARCH] Query initiated for: "${query}"`);

    // 2. Search the Local Vault First
    const { data: localBooks, error: localError } = await supabaseAdmin
      .from('books')
      .select('id, title, author, category, cover_image_url')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .limit(10);

    if (localError) {
       console.error('[LIVE SEARCH] DB Read Error:', localError);
    }

    // If we have the books, serve them immediately
    if (localBooks && localBooks.length > 0) {
      console.log(`[LIVE SEARCH] Found ${localBooks.length} results in local vault.`);
      return NextResponse.json({ success: true, source: 'vault', books: localBooks });
    }

    console.log(`[LIVE SEARCH] Vault empty. Striking Google API...`);

    // 3. Strike the Google API
    const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    
    if (!googleRes.ok) {
       console.error(`[LIVE SEARCH] Google API rejected request. Status: ${googleRes.status}`);
       return NextResponse.json({ error: 'Google API blocked the request.' }, { status: 500 });
    }

    const googleData = await googleRes.json();

    if (!googleData.items || googleData.items.length === 0) {
      console.log(`[LIVE SEARCH] Google returned zero results.`);
      return NextResponse.json({ success: true, source: 'empty', books: [] });
    }

    // 4. Format the stolen data
    const newBooks = googleData.items.map((item: any) => {
      const info = item.volumeInfo;
      const isbn13 = info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier || null;

      return {
        title: info.title || 'Unknown Title',
        author: info.authors ? info.authors.join(', ') : 'Unknown Author',
        category: info.categories ? info.categories[0] : 'General',
        isbn13: isbn13,
        cover_image_url: 'UNAVAILABLE' // Pre-tag it so the storefront doesn't break
      };
    });

    console.log(`[LIVE SEARCH] Injecting ${newBooks.length} books into Supabase...`);

    // 5. Inject into database with Master Key
    const { data: insertedBooks, error: insertError } = await supabaseAdmin
      .from('books')
      .insert(newBooks)
      .select('id, title, author, category, cover_image_url');

    if (insertError) {
      console.error('[LIVE SEARCH] Supabase Insert Error:', insertError);
      return NextResponse.json({ error: `Database blocked insertion: ${insertError.message}` }, { status: 500 });
    }

    console.log(`[LIVE SEARCH] Successfully injected. Returning to frontend.`);
    return NextResponse.json({ success: true, source: 'google_ingested', books: insertedBooks });

  } catch (error: any) {
    console.error('[LIVE SEARCH] Catastrophic Misfire:', error.message);
    return NextResponse.json({ error: 'Search engine misfire.' }, { status: 500 });
  }
}