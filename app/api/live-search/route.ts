import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Dropped to 30s to prevent the UI from "freezing"

export async function GET(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ error: 'No query provided.' }, { status: 400 });

  try {
    // 1. Fetch from Google First (The Global Haul)
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const fetchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&key=${apiKey}`;
    
    const googleRes = await fetch(fetchUrl);
    const googleData = await googleRes.json();

    let newBooks: any[] = [];

    // 2. Format the Google Books
    if (googleData.items && googleData.items.length > 0) {
      newBooks = googleData.items.map((item: any) => ({
        title: item.volumeInfo.title || 'Unknown Title',
        author: item.volumeInfo.authors?.join(', ') || 'Unknown Author',
        category: item.volumeInfo.categories?.[0] || 'General',
        isbn13: item.volumeInfo.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier || null,
        cover_image_url: item.volumeInfo.imageLinks?.thumbnail || 'UNAVAILABLE'
      }));

      // 3. Attempt Vault Injection (If it fails, we don't care, we still show the books!)
      try {
        const titles = newBooks.map((b: any) => b.title);
        const { data: existingBooks } = await supabaseAdmin.from('books').select('title').in('title', titles);
        const existingTitles = existingBooks?.map(e => e.title) || [];
        const safeBooks = newBooks.filter((b: any) => !existingTitles.includes(b.title));
        
        if (safeBooks.length > 0) {
          await supabaseAdmin.from('books').insert(safeBooks);
        }
      } catch (dbError) {
        console.warn('[VAULT WARNING] Background save failed, but proceeding to display books.');
      }
    }

    // 4. Fetch whatever we already have in the Vault
    let vaultBooks: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('books')
        .select('id, title, author, category, cover_image_url, isbn13')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
        .limit(20);
      if (data) vaultBooks = data;
    } catch (dbFetchError) {
      console.warn('[VAULT WARNING] Vault read failed.');
    }

    // 5. THE MASTER MERGE: Combine Vault books + Brand new Google books
    const displayBooks = [...vaultBooks];
    
    for (const nb of newBooks) {
      // If the book isn't already in our display list, add it with a temporary ID for the screen
      if (!displayBooks.find(b => b.title === nb.title)) {
        displayBooks.push({
          id: Math.random().toString(), 
          ...nb
        });
      }
    }

    // Send everything straight to the storefront
    return NextResponse.json({ success: true, books: displayBooks });

  } catch (error: any) {
    console.error('[CRITICAL ENGINE FAILURE]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}