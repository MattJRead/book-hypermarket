import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'warhammer'; 
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'CRITICAL: Google API key missing.' }, { status: 500 });
  }

  const determineCategory = (googleCategories: string[] | undefined) => {
    if (!googleCategories || googleCategories.length === 0) return 'General';
    
    const catString = googleCategories.join(' ').toLowerCase();
    
    if (catString.includes('horror') || catString.includes('vampire') || catString.includes('occult')) return 'Horror';
    if (catString.includes('science') || catString.includes('math') || catString.includes('education') || catString.includes('computers')) return 'Learning / Educational';
    if (catString.includes('fiction') || catString.includes('fantasy') || catString.includes('comics')) return 'Fiction';
    if (catString.includes('history') || catString.includes('biography') || catString.includes('memoir') || catString.includes('business')) return 'Non-Fiction';
    
    return 'General'; 
  };

  try {
    const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40&key=${apiKey}`);
    const data = await googleRes.json();

    if (!data.items) {
      return NextResponse.json({ error: 'No books found in Google Vault.' }, { status: 404 });
    }

    const booksToInsert = [];

    for (const item of data.items) {
      const info = item.volumeInfo;
      const title = info.title;
      const authors = info.authors ? info.authors.join(', ') : 'Unknown Author';
      const assignedCategory = determineCategory(info.categories); 
      
      // 1. Ask Google for the image
      const rawImageUrl = info.imageLinks?.thumbnail || null;
      const secureImageUrl = rawImageUrl ? rawImageUrl.replace('http:', 'https:') : null;
      
      // Extract the ISBN
      let isbn13 = null;
      if (info.industryIdentifiers) {
        const isbnObj = info.industryIdentifiers.find((id: { type: string, identifier: string }) => id.type === 'ISBN_13');
        if (isbnObj) isbn13 = isbnObj.identifier;
      }

      // 🌊 THE WATERFALL: If Google is empty, construct the Open Library fallback
      const finalImageUrl = secureImageUrl || (isbn13 ? `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg` : null);

      // The Wiretap Report
      console.log(`Scanning: ${title} | Google Image: ${secureImageUrl ? 'YES' : 'NO'} | Final Image Assigned: ${finalImageUrl ? 'YES' : 'NO'}`);

      if (title && authors && isbn13) {
        booksToInsert.push({ 
          title, 
          author: authors, 
          isbn13, 
          category: assignedCategory,
          cover_image_url: finalImageUrl 
        });
      }
    }

    // Upsert the data to prevent database crashes from duplicates
    const { error } = await supabase.from('books').upsert(booksToInsert, { onConflict: 'isbn13' });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to insert into Supabase' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ingested ${booksToInsert.length} books with Open Library Waterfall active.` 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Ingestion engine misfired' }, { status: 500 });
  }
}