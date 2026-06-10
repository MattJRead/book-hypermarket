import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Helper to spoof a real web browser to bypass basic security
const fetchOptions = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.5',
  },
  // Vercel serverless timeout protection
  next: { revalidate: 3600 } 
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn');

  if (!isbn) {
    return NextResponse.json({ error: 'Missing ISBN' }, { status: 400 });
  }

  console.log(`[Price Radar] Deploying bots for ISBN: ${isbn}`);

  // --- THE INDIVIDUAL SHOP BOTS ---

  const scrapeBlackwells = async () => {
    try {
      const res = await fetch(`https://blackwells.co.uk/bookshop/search/?keyword=${isbn}`, fetchOptions);
      if (!res.ok) throw new Error('Blocked');
      const html = await res.text();
      const $ = cheerio.load(html);
      // Blackwells usually keeps prices in a class containing 'price'
      const priceText = $('.product-price').first().text().trim() || $('.price').first().text().trim();
      const match = priceText.match(/[£$€][\d.]+/);
      return match ? match[0] : 'Out of Stock';
    } catch (e) { return 'Out of Stock'; }
  };

  const scrapeWaterstones = async () => {
    try {
      const res = await fetch(`https://www.waterstones.com/books/search/term/${isbn}`, fetchOptions);
      if (!res.ok) throw new Error('Cloudflare Blocked');
      const html = await res.text();
      const $ = cheerio.load(html);
      const priceText = $('.price').first().text().trim();
      const match = priceText.match(/[£$€][\d.]+/);
      return match ? match[0] : 'Out of Stock';
    } catch (e) { return 'Out of Stock'; }
  };

  const scrapeEbay = async () => {
    try {
      const res = await fetch(`https://www.ebay.co.uk/sch/i.html?_nkw=${isbn}`, fetchOptions);
      if (!res.ok) throw new Error('Blocked');
      const html = await res.text();
      const $ = cheerio.load(html);
      // eBay UK price selector
      const priceText = $('.s-item__price').first().text().trim();
      const match = priceText.match(/[£$€][\d.]+/);
      return match ? match[0] : 'Check Site';
    } catch (e) { return 'Check Site'; }
  };

  const scrapeWob = async () => {
    try {
      const res = await fetch(`https://www.wob.com/en-gb/category/all?search=${isbn}`, fetchOptions);
      if (!res.ok) throw new Error('Blocked');
      const html = await res.text();
      const $ = cheerio.load(html);
      // Wob price selector
      const priceText = $('.price').first().text().trim() || $('.item-price').first().text().trim();
      const match = priceText.match(/[£$€][\d.]+/);
      return match ? match[0] : 'Check Site';
    } catch (e) { return 'Check Site'; }
  };

  // --- THE CONCURRENT COMMANDER ---
  // We fire all bots at the exact same time so the user isn't waiting 10 seconds for the page to load.
  const [blackwells, waterstones, ebay, wob] = await Promise.allSettled([
    scrapeBlackwells(),
    scrapeWaterstones(),
    scrapeEbay(),
    scrapeWob()
  ]);

  return NextResponse.json({
    blackwells: blackwells.status === 'fulfilled' ? blackwells.value : 'Out of Stock',
    waterstones: waterstones.status === 'fulfilled' ? waterstones.value : 'Out of Stock',
    ebay: ebay.status === 'fulfilled' ? ebay.value : 'Check Site',
    wob: wob.status === 'fulfilled' ? wob.value : 'Check Site',
    amazon: 'Check Site' // Waiting on official PA-API approval
  });
}