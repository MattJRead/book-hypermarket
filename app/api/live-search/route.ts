import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    // 1. Strike Google directly
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query!)}&maxResults=5&key=${apiKey}`);
    const data = await res.json();

    // 2. Return the data to the frontend, NO database involved
    if (!data.items) return NextResponse.json({ success: true, books: [] });

    const books = data.items.map((item: any) => ({
      id: Math.random().toString(),
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.join(', ') || 'Unknown',
      category: 'General',
      cover_image_url: item.volumeInfo.imageLinks?.thumbnail || 'UNAVAILABLE'
    }));

    return NextResponse.json({ success: true, books: books });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}