import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn');

  if (!isbn) {
    return NextResponse.json({ error: 'CRITICAL: No ISBN provided.' }, { status: 400 });
  }

  let waterstonesPrice = 'Out of Stock';
  let blackwellsPrice = 'Out of Stock';

  // Advanced Stealth Protocol: Mimicking a modern Chrome browser with human-like acceptance headers
  const stealthHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.5',
  };

  try {
    console.log(`\n[Vault Scraper] Initiating scan for ISBN: ${isbn}`);

    // ==========================================
    // 1. INFILTRATE WATERSTONES
    // ==========================================
    const wsResponse = await fetch(`https://www.waterstones.com/books/search/term/${isbn}`, { headers: stealthHeaders });
    console.log(`[Vault Scraper] Waterstones Response Code: ${wsResponse.status}`);
    
    if (wsResponse.ok) {
      const wsHtml = await wsResponse.text();
      const $ws = cheerio.load(wsHtml);
      
      // The Multi-Net: Checks 4 different common HTML locations Waterstones uses for pricing
      const rawPrice = $ws('.price').first().text().trim() || 
                       $ws('[itemprop="price"]').first().text().trim() || 
                       $ws('.item-price').first().text().trim() ||
                       $ws('span:contains("£")').first().text().trim();
                       
      if (rawPrice) {
        waterstonesPrice = rawPrice;
      } else {
         console.log(`[Vault Scraper] Waterstones loaded, but could not find the price tag in the HTML.`);
      }
    } else {
       console.log(`[Vault Scraper] Waterstones actively blocked the request (Usually Cloudflare).`);
    }

    // ==========================================
    // 2. INFILTRATE BLACKWELL'S
    // ==========================================
    const bwResponse = await fetch(`https://blackwells.co.uk/bookshop/search/?keyword=${isbn}`, { headers: stealthHeaders });
    console.log(`[Vault Scraper] Blackwell's Response Code: ${bwResponse.status}`);
    
    if (bwResponse.ok) {
      const bwHtml = await bwResponse.text();
      const $bw = cheerio.load(bwHtml);
      
      // The Multi-Net for Blackwell's
      const rawPrice = $bw('.product-price').first().text().trim() || 
                       $bw('.price--large').first().text().trim() ||
                       $bw('.price').first().text().trim();
                       
      if (rawPrice) {
        blackwellsPrice = rawPrice;
      } else {
         console.log(`[Vault Scraper] Blackwell's loaded, but could not find the price tag in the HTML.`);
      }
    } else {
       console.log(`[Vault Scraper] Blackwell's actively blocked the request (Usually Cloudflare).`);
    }

  } catch (error) {
    console.error("[Vault Scraper] Engine misfired completely:", error);
  }

  return NextResponse.json({ 
    waterstones: waterstonesPrice, 
    blackwells: blackwellsPrice 
  });
}