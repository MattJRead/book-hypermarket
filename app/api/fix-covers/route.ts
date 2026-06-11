import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import * as cheerio from 'cheerio';

const fetchOptions = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
  }
};

export async function GET() {
  try {
    // 1. Find up to 10 books that have a missing cover
    const { data: books, error } = await supabase
      .from('books')
      .select('id, isbn13, title')
      .is('cover_image_url', null)
      .limit(10);

    if (error || !books) {
      return NextResponse.json({ error: 'Database read failed' }, { status: 500 });
    }

    if (books.length === 0) {
      return NextResponse.json({ success: true, message: 'All books have covers. Vault is completely full.' });
    }

    let updatedCount = 0;

    // 2. Hunt down the covers
    for (const book of books) {
      let foundImageUrl = null;

      // 🎯 TACTIC 1: Direct Blackwells Product Page
      try {
        const bwRes = await fetch(`https://blackwells.co.uk/bookshop/product/${book.isbn13}`, fetchOptions);
        if (bwRes.ok) {
          const html = await bwRes.text();
          const $ = cheerio.load(html);
          // Grab the hidden high-res social media image
          const ogImage = $('meta[property="og:image"]').attr('content');
          if (ogImage && !ogImage.includes('no_image')) {
            foundImageUrl = ogImage;
          }
        }
      } catch (e) {
        // Silently fail and move to the next target
      }

      // 🎯 TACTIC 2: Waterstones Search Fallback
      if (!foundImageUrl) {
        try {
          const wsRes = await fetch(`https://www.waterstones.com/books/search/term/${book.isbn13}`, fetchOptions);
          if (wsRes.ok) {
            const html = await wsRes.text();
            const $ = cheerio.load(html);
            const img = $('.book-thumb img').first().attr('src');
            if (img && !img.includes('no-image')) {
              foundImageUrl = img;
            }
          }
        } catch (e) {
          // Silently fail
        }
      }

     // 3. Inject the stolen artwork into your database
      if (foundImageUrl) {
        await supabase.from('books').update({ cover_image_url: foundImageUrl }).eq('id', book.id);
        updatedCount++;
      } else {
        // Mark as dead-end so the script doesn't get stuck in an infinite loop
        await supabase.from('books').update({ cover_image_url: 'UNAVAILABLE' }).eq('id', book.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Scanned ${books.length} books. Successfully stole and injected ${updatedCount} covers.` 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Engine misfired' }, { status: 500 });
  }
}