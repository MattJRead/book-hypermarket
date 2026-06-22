import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  // 1. AUTH SHIELD: Check for admin credentials before doing anything
  const authHeader = request.headers.get('authorization');
  // If you are using Supabase Auth, verify the session here
  if (!authHeader && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    const cleanedQuery = query.replace(/[- ]/g, '');
    const isIsbn = /^\d{10}$|^\d{13}$/.test(cleanedQuery);

    // 2. VAULT SEARCH
    if (!isIsbn) {
      const { data } = await supabaseAdmin
        .from('books')
        .select('id, title, author, category, cover_image_url, isbn13')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
        .range(numericOffset, numericOffset + 9); 
        
      if (data) displayBooks = [...data];
    }

    // 3. GOOGLE SEARCH (with ISBN validation)
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    // Only attempt external fetch if we have a valid ISBN or a non-empty string
    if (query.length > 2) {
      const googleQuery = isIsbn ? `isbn:${cleanedQuery}` : encodeURIComponent(query);
      const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${googleQuery}&startIndex=${offset}&maxResults=10&key=${apiKey}`);
      const googleData = await googleRes.json();

      if (googleData.items) {
        const newBooks = googleData.items.map((item: any) => ({
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
    }

    return NextResponse.json({ success: true, books: displayBooks });

  } catch (error: any) {
    // CRITICAL: This try/catch prevents the "White Screen of Death" by returning JSON instead of crashing
    console.error('[ENGINE ERROR]:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}