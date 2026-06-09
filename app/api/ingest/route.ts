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
      
      let isbn13 = null;
      if (info.industryIdentifiers) {
        const isbnObj = info.industryIdentifiers.find((id: { type: string, identifier: string }) => id.type === 'ISBN_13');
        if (isbnObj) isbn13 = isbnObj.identifier;
      }

      // TIER 1: Google
      const rawImageUrl = info.imageLinks?.thumbnail || null;
      let finalImageUrl = rawImageUrl ? rawImageUrl.replace('http:', 'https:') : null;
      let imageSource = finalImageUrl ? 'GOOGLE' : 'NONE';

      // TIER 2: Gardners Backdoor
      if (!finalImageUrl && isbn13) {
        const gardnersPrefix = isbn13.substring(0, 8);
        const gardnersUrl = `https://jackets.gardners.com/media/640/${gardnersPrefix}/${isbn13}.jpg`;
        try {
          const check = await fetch(gardnersUrl, { method: 'HEAD' });
          if (check.ok) { finalImageUrl = gardnersUrl; imageSource = 'GARDNERS'; }
        } catch (e) {}
      }

      // TIER 3: DMM Server Backdoor
      if (!finalImageUrl && isbn13) {
        const dmmPrefix = isbn13.substring(0, 8);
        const dmmUrl = `https://jackets.dmmserver.com/media/640/${dmmPrefix}/${isbn13}.jpg`;
        try {
          const check = await fetch(dmmUrl, { method: 'HEAD' });
          if (check.ok) { finalImageUrl = dmmUrl; imageSource = 'DMMSERVER'; }
        } catch (e) {}
      }

      // TIER 4: Open Library (Ghost-Pixel Proofed)
      if (!finalImageUrl && isbn13) {
        // The ?default=false forces a 404 error if the image doesn't actually exist
        const olUrl = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg?default=false`;
        try {
          const check = await fetch(olUrl, { method: 'HEAD' });
          if (check.ok) { finalImageUrl = olUrl; imageSource = 'OPEN_LIBRARY'; }
        } catch (e) {}
      }

      console.log(`Scanning: ${title.substring(0,30)}... | Source Secured: ${imageSource}`);

      if (title && authors && isbn13) {
        booksToInsert.push({ 
          title, author: authors, isbn13, category: assignedCategory, cover_image_url: finalImageUrl 
        });
      }
    }

    const { error } = await supabase.from('books').upsert(booksToInsert, { onConflict: 'isbn13' });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to insert into Supabase' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ingested ${booksToInsert.length} books. 4-Tier Waterfall Active.` 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Ingestion engine misfired' }, { status: 500 });
  }
}