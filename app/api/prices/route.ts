import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn');
  const title = searchParams.get('title');

  if (!isbn && !title) {
    return NextResponse.json({ error: 'Missing ISBN or Title' }, { status: 400 });
  }

  // Use ISBN for maximum accuracy if available, fallback to title
  const searchQuery = isbn && isbn !== 'undefined' ? isbn : title;

  // The default payload required by your frontend BookCard
  const prices = {
    waterstones: 'Check Site',
    blackwells: 'Check Site',
    amazon: 'Check Site',
    ebay: 'Check Site',
    bookshop: 'Check Site'
  };

  try {
    // Fire the scanners simultaneously so the user doesn't wait
    const [blackwellsPrice, bookshopPrice] = await Promise.allSettled([
      fetchBlackwellsPrice(searchQuery as string),
      fetchBookshopPrice(searchQuery as string)
    ]);

    // If the vaults return a hit, update the payload
    if (blackwellsPrice.status === 'fulfilled' && blackwellsPrice.value) {
      prices.blackwells = blackwellsPrice.value;
    }
    if (bookshopPrice.status === 'fulfilled' && bookshopPrice.value) {
      prices.bookshop = bookshopPrice.value;
    }

  } catch (error) {
    console.error('Radar Jammed:', error);
  }

  return NextResponse.json(prices);
}

// ==========================================
// INDIVIDUAL STORE SCANNERS
// ==========================================

async function fetchBlackwellsPrice(query: string) {
  try {
    const res = await fetch(`https://blackwells.co.uk/bookshop/search/?keyword=${encodeURIComponent(query)}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      next: { revalidate: 3600 } // Cache results for 1 hour to prevent IP bans
    });
    
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Target the specific CSS class where Blackwells holds their price
    const priceText = $('.product-price').first().text().trim();
    const match = priceText.match(/£\d+\.\d{2}/);
    
    return match ? match[0] : null;
  } catch {
    return null;
  }
}

async function fetchBookshopPrice(query: string) {
  try {
    const res = await fetch(`https://uk.bookshop.org/search?keywords=${encodeURIComponent(query)}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Target the UK Bookshop.org price element
    const priceText = $('div.text-xl.font-bold').first().text().trim() || $('.price').first().text().trim();
    const match = priceText.match(/£\d+\.\d{2}/);
    
    return match ? match[0] : null;
  } catch {
    return null;
  }
}