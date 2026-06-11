import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'No search query provided.' }, { status: 400 });
  }

  try {
    // 1. Search the Local Vault First
    const { data: localBooks, error: localError } = await supabase
      .from('books')
      .select('id, title, author, category, cover_image_url')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .limit(10);

    // If we have the books, serve them immediately
    if (localBooks && localBooks.length > 0) {
      return NextResponse.json({ success: true, source: 'vault', books: localBooks });
    }

    // 2. The Vault is empty. Strike the Google API for Pre-Orders & Missing Books.
    const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const googleData = await googleRes.json();

    // If even Google doesn't have it, return an empty array
    if (!googleData.items || googleData.items.length === 0) {
      return NextResponse.json({ success: true, source: 'empty', books: [] });
    }

    // 3. Format the stolen data to match your database schema perfectly
    const newBooks = googleData.items.map((item: any) => {
      const info = item.volumeInfo;
      const isbn13 = info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier || null;

      return {
        title: info.title || 'Unknown Title',
        author: info.authors ? info.authors.join(', ') : 'Unknown Author',
        category: info.categories ? info.categories[0] : 'General',
        isbn13: isbn13,
        cover_image_url: null // Deliberately left null so your Cover Hunter script patches it tonight
      };
    });

    // 4. Inject the new books into your Supabase database permanently
    const { data: insertedBooks, error: insertError } = await supabase
      .from('books')
      .insert(newBooks)
      .select('id, title, author, category, cover_image_url');

    if (insertError) {
      return NextResponse.json({ error: 'Database injection failed.' }, { status: 500 });
    }

    // 5. Hand the brand new inventory back to the storefront instantly
    return NextResponse.json({ success: true, source: 'google_ingested', books: insertedBooks });

  } catch (error) {
    return NextResponse.json({ error: 'Search engine misfire.' }, { status: 500 });
  }
}