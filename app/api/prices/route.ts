import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const fetchOptions = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.5',
  },
  next: { revalidate: 3600 } 
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn');
  const title = searchParams.get('title'); // 🎯 NEW: Accept the title for the fallback

  if (!isbn) {
    return NextResponse.json({ error: 'Missing ISBN' }, { status: 400 });
  }

  const encodedTitle = title ? encodeURIComponent(title) : '';

  console.log(`[Price Radar] Deploying bots for: ${isbn} / ${title}`);

 // --- THE INDIVIDUAL SHOP BOTS (Defaulting to Check Site on errors) ---

  const scrapeBlackwells = async (query: string) => {
    try {
      const res = await fetch(`https://blackwells.co.uk/bookshop/search/?keyword=${query}`, fetchOptions);
      if (!res.ok) throw new Error('Blocked');
      const html = await res.text();
      const $ = cheerio.load(html);
      const priceText = $('.product-price').first().text().trim() || $('.price').first().text().trim();
      const match = priceText.match(/[£$€][\d.]+/);
      return match ? match[0] : 'Check Site';
    } catch (e) { return 'Check Site'; }
  };

  const scrapeWaterstones = async (query: string) => {
    try {
      const res = await fetch(`https://www.waterstones.com/books/search/term/${query}`, fetchOptions);
      if (!res.ok) throw new Error('Cloudflare Blocked');
      const html = await res.text();
      const $ = cheerio.load(html);
      const priceText = $('.price').first().text().trim();
      const match = priceText.match(/[£$€][\d.]+/);
      return match ? match[0] : 'Check Site';
    } catch (e) { return 'Check Site'; }
  };

  const scrapeEbay = async (query: string) => {
    try {
      const res = await fetch(`https://www.ebay.co.uk/sch/i.html?_nkw=${query}`, fetchOptions);
      if (!res.ok) throw new Error('Blocked');
      const html = await res.text();
      const $ = cheerio.load(html);
      const priceText = $('.s-item__price').first().text().trim();
      const match = priceText.match(/[£$€][\d.]+/);
      return match ? match[0] : 'Check Site';
    } catch (e) { return 'Check Site'; }
  };

  const scrapeWob = async (query: string) => {
    try {
      const res = await fetch(`https://www.wob.com/en-gb/category/all?search=${query}`, fetchOptions);
      if (!res.ok) throw new Error('Blocked');
      const html = await res.text();
      const $ = cheerio.load(html);
      const priceText = $('.price').first().text().trim() || $('.item-price').first().text().trim();
      const match = priceText.match(/[£$€][\d.]+/);
      return match ? match[0] : 'Check Site';
    } catch (e) { return 'Check Site'; }
  };

  // --- 🌊 THE FALLBACK COMMANDER ---
  const tryScrape = async (scrapeFn: (q: string) => Promise<string>, primary: string, fallback: string) => {
    let result = await scrapeFn(primary);
    if ((result === 'Out of Stock' || result === 'Check Site') && fallback) {
      console.log(`[Price Radar] ISBN failed. Falling back to title search...`);
      result = await scrapeFn(fallback);
    }
    return result;
  };

  const [blackwells, waterstones, ebay, wob] = await Promise.allSettled([
    tryScrape(scrapeBlackwells, isbn, encodedTitle),
    tryScrape(scrapeWaterstones, isbn, encodedTitle),
    tryScrape(scrapeEbay, isbn, encodedTitle),
    tryScrape(scrapeWob, isbn, encodedTitle)
  ]);

  return NextResponse.json({
    blackwells: blackwells.status === 'fulfilled' ? blackwells.value : 'Out of Stock',
    waterstones: waterstones.status === 'fulfilled' ? waterstones.value : 'Out of Stock',
    ebay: ebay.status === 'fulfilled' ? ebay.value : 'Check Site',
    wob: wob.status === 'fulfilled' ? wob.value : 'Check Site',
    amazon: 'Check Site' 
  });
}