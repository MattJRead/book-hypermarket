import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const offset = searchParams.get('offset') || '0'; 

  if (!query) return NextResponse.json({ error: 'No query provided.' }, { status: 400 });

  try {
    let displayBooks: any[] = [];
    const numericOffset = parseInt(offset, 10);

    // 1. THE MATH CHECK: Is this an ISBN barcode scan?
    const cleanedQuery = query.replace(/[- ]/g, '');
    const isIsbn = /^\d{10}$|^\d{13}$/.test(cleanedQuery);

    // 2. INTERNAL VAULT SEARCH (Only runs if it is NOT a barcode)
    if (!isIsbn) {
      const { data } = await supabaseAdmin
        .from('books')
        .select('id, title, author, category, cover_image_url, isbn13')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
        .range(numericOffset, numericOffset + 9); 
        
      if (data) displayBooks = [...data];
    }

    // 3. EXTERNAL GOOGLE SEARCH (Read-Only)
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const googleQuery = isIsbn ? `isbn:${cleanedQuery}` : encodeURIComponent(query);
    const fetchUrl = `https://www.googleapis.com/books/v1/volumes?q=${googleQuery}&startIndex=${offset}&maxResults=10&key=${apiKey}`;
    
    const googleRes = await fetch(fetchUrl);
    const googleData = await googleRes.json();

    if (googleData.items && googleData.items.length > 0) {
      const newBooks = googleData.items.map((item: any) => ({
        // Tag temporary books with 'ext_' so the frontend knows they aren't in your DB yet
        id: `ext_${Math.random().toString(36).substring(2, 9)}`, 
        title: item.volumeInfo.title || 'Unknown Title',
        author: item.volumeInfo.authors?.join(', ') || 'Unknown Author',
        category: item.volumeInfo.categories?.[0] || 'General',
        isbn13: item.volumeInfo.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13' || i.type === 'ISBN_10')?.identifier || cleanedQuery,
        cover_image_url: item.volumeInfo.imageLinks?.thumbnail || 'UNAVAILABLE'
      }));

      for (const nb of newBooks) {
        if (!displayBooks.find(b => b.title === nb.title || b.isbn13 === nb.isbn13)) {
          displayBooks.push(nb);
        }
      }
    }

    // Zero Database Writes - Send directly to the user
    return NextResponse.json({ success: true, books: displayBooks });

  } catch (error: any) {
    console.error('[CRITICAL ENGINE FAILURE]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}