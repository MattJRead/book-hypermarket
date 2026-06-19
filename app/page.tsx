'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../lib/supabase';
import FloatingMenu from '../components/FloatingMenu';
import { SpeedInsights } from "@vercel/speed-insights/next"
import NotificationBell from '../components/NotificationBell';
import BarcodeScanner from '../components/BarcodeScanner';
import { useTheme } from '@/components/ThemeProvider';

type Book = { id: string; title: string; author: string; isbn13: string; category: string; cover_image_url?: string; format?: string; };
type Banner = { id: string; title: string; subtitle: string; background_image_url: string; text_color: string; landing_page_text: string; target_isbns: string[]; slot_position: number; };

// ==========================================
// THE SCHOLASTIC SPOTLIGHT DATA & ENGINE
// ==========================================
const scholasticSpotlight = [
  { id: 's-1', title: 'Books For Ages 0-6', description: 'The Newest and Best Books for 0-6 year olds, chosen by experts.', link: 'https://tidd.ly/4ezEfm2', color: 'bg-red-500' },
  { id: 's-2', title: 'Books For Ages 7-11', description: 'The Newest and Best Books for 7-11 year olds, chosen by experts.', link: 'https://tidd.ly/44nvOW0', color: 'bg-red-500' },
  { id: 's-3', title: 'Books For Ages 11+', description: 'The Best Young Adult Fiction and Non-Fiction, chosen by experts.', link: 'https://tidd.ly/4eNVaCB', color: 'bg-red-500' },
  { id: 's-4', title: 'Award-Winning Books', description: 'Explore Award-Winning Books on Scholastic.', link: 'https://tidd.ly/4oz5IJ2', color: 'bg-red-700' },
  { id: 's-main', title: 'Award-Winning Authors', description: 'Explore Award-Winning Authors on Scholastic.', link: 'https://tidd.ly/4vXgqeQ', color: 'bg-red-700' }
];

function ScholasticCarousel({ isDarkMode }: { isDarkMode: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto mt-8 mb-12 px-4 relative group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-600/20">S</span>
            Scholastic Spotlight
          </h2>
          <p className={`mt-1 font-medium ${!isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            The global leader in children's publishing.
          </p>
        </div>
        <a href="https://tidd.ly/3QUpTEV" target="_blank" rel="noopener noreferrer" className="hidden md:flex text-sm font-bold text-red-500 hover:text-red-400 transition-colors items-center">
          View All <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </a>
      </div>
      
      <div className="relative w-full">
        {/* Floating Arrows */}
        <button onClick={() => scroll('left')} className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 -ml-4 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
        <button onClick={() => scroll('right')} className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 -mr-4 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>

        {/* Scroll Container with hidden scrollbar */}
        <div ref={scrollRef} className="flex overflow-x-auto gap-6 snap-x snap-mandatory py-4 px-2 -mx-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {scholasticSpotlight.map((item) => (
            <a 
              key={item.id} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`snap-start shrink-0 w-[260px] md:w-[280px] rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border group ${!isDarkMode ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-900 border-gray-800'}`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${item.color}`} />
              
              <h3 className={`text-xl font-bold mb-2 transition-colors ${!isDarkMode ? 'text-gray-900 group-hover:text-red-600' : 'text-white group-hover:text-red-400'}`}>
                {item.title}
              </h3>
              <p className={`text-sm flex-grow leading-relaxed ${!isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                {item.description}
              </p>
              
              <div className={`mt-6 text-sm font-bold flex items-center transition-colors ${!isDarkMode ? 'text-gray-400 group-hover:text-gray-900' : 'text-gray-400 group-hover:text-white'}`}>
                Shop Now <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 1. THE BOOK CARD ENGINE
// ==========================================
function BookCard({ book, isDarkMode, userId, initiallyOwned, initiallyWishlisted, onAuthorClick }: { book: Book, isDarkMode: boolean, userId: string | null, initiallyOwned: boolean, initiallyWishlisted: boolean, onAuthorClick?: (author: string) => void }) {
  const [prices, setPrices] = useState<{ waterstones: string, blackwells: string, amazon: string, ebay: string, wob: string } | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [isOwned, setIsOwned] = useState(initiallyOwned);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(initiallyWishlisted);
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState('waterstones');
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>(book.cover_image_url === 'UNAVAILABLE' ? 'error' : 'loading');
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [realBookId, setRealBookId] = useState(book.id);

  useEffect(() => { setIsOwned(initiallyOwned); setIsWishlisted(initiallyWishlisted); }, [initiallyOwned, initiallyWishlisted]);

  const formatPrice = (raw: string | undefined) => {
    if (!raw) return 'Check Site';
    if (raw === 'Out of Stock') return 'Out of Stock';
    if (raw === 'Check Site') return 'Check Site';
    const match = raw.match(/[£$€][\d.]+/);
    return match ? match[0] : 'Check Site';
  };

  const titleSearchQuery = encodeURIComponent(book.title);
  const waterstonesLink = `https://www.waterstones.com/books/search/term/${titleSearchQuery}`;
  const blackwellsLink = `https://blackwells.co.uk/bookshop/search/?keyword=${titleSearchQuery}`;
  const amazonLink = `https://www.amazon.co.uk/s?k=${titleSearchQuery}&tag=bookhypermarket-21`;
  const ebayLink = `https://www.ebay.co.uk/sch/i.html?_nkw=${titleSearchQuery}&mkcid=1&mkrid=710-53481-19255-0&siteid=3&campid=5339156569&toolid=10001&mkevt=1`;
  const wobLink = `https://www.wob.com/en-gb/category/all?search=${titleSearchQuery}`;

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch(`/api/prices?isbn=${book.isbn13}&title=${encodeURIComponent(book.title)}`);
        const data = await res.json();
        setPrices(data);
        const evaluatePrice = (priceStr: string) => {
          if (!priceStr || priceStr === 'Out of Stock' || priceStr === 'Check Site') return Infinity;
          const match = priceStr.match(/[\d.]+/);
          return match ? parseFloat(match[0]) : Infinity;
        };
        const shopRankings = [
          { id: 'waterstones', price: evaluatePrice(data.waterstones) },
          { id: 'blackwells', price: evaluatePrice(data.blackwells) },
          { id: 'amazon', price: evaluatePrice(data.amazon) },
          { id: 'ebay', price: evaluatePrice(data.ebay) },
          { id: 'wob', price: evaluatePrice(data.wob) }
        ];
        shopRankings.sort((a, b) => a.price - b.price);
        const bestShop = shopRankings.find(s => s.price !== Infinity);
        if (bestShop) setSelectedShopId(bestShop.id);
      } catch (error) { console.error("Failed to fetch prices"); }
      setIsLoadingPrice(false);
    }
    fetchPrices();
  }, [book.isbn13, book.title]);

  const shops = [
    { id: 'waterstones', name: 'Waterstones', url: waterstonesLink, displayPrice: formatPrice(prices?.waterstones) },
    { id: 'blackwells', name: 'Blackwells', url: blackwellsLink, displayPrice: formatPrice(prices?.blackwells) },
    { id: 'amazon', name: 'Amazon', url: amazonLink, displayPrice: formatPrice(prices?.amazon) },
    { id: 'ebay', name: 'eBay', url: ebayLink, displayPrice: formatPrice(prices?.ebay) },
    { id: 'wob', name: 'World of Books', url: wobLink, displayPrice: formatPrice(prices?.wob) },
  ];

  const currentShop = shops.find(s => s.id === selectedShopId) || shops[0];

  const ensureBookInDatabase = async () => {
    if (!realBookId.startsWith('ext_')) return realBookId; 
    try {
      const res = await fetch('/api/save-book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
      const data = await res.json();
      if (data.id) { setRealBookId(data.id); return data.id; }
    } catch (e) { console.error("Failed to provision book:", e); }
    return realBookId;
  };

  const toggleLibrary = async () => {
    if (!userId) return;
    setIsUpdating(true);
    const dbBookId = await ensureBookInDatabase();
    const newStatus = !isOwned;
    setIsOwned(newStatus); 
    try {
      if (newStatus) await supabase.from('user_libraries').insert({ user_id: userId, book_id: dbBookId });
      else await supabase.from('user_libraries').delete().match({ user_id: userId, book_id: dbBookId });
    } catch (error) { setIsOwned(!newStatus); }
    setIsUpdating(false);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!userId) return;
    setIsWishlistUpdating(true);
    const dbBookId = await ensureBookInDatabase();
    const newStatus = !isWishlisted;
    setIsWishlisted(newStatus); 
    try {
      if (newStatus) await supabase.from('user_wishlists').insert({ user_id: userId, book_id: dbBookId });
      else await supabase.from('user_wishlists').delete().match({ user_id: userId, book_id: dbBookId });
    } catch (error) { setIsWishlisted(!newStatus); }
    setIsWishlistUpdating(false);
  };

  return (
    <>
      <div className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] shadow-sm h-full relative overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} ${isOwned ? 'ring-2 ring-emerald-500' : ''}`}>
        {isOwned && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>}

        <div onClick={() => setIsCoverModalOpen(true)} className={`w-32 h-48 shrink-0 rounded-md mb-4 shadow-lg flex flex-col items-center justify-center z-10 overflow-hidden relative border cursor-pointer transition-all hover:ring-2 hover:ring-sky-500 group ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-100'}`} title="Click to expand cover">
          {userId && (
            <button onClick={toggleWishlist} disabled={isWishlistUpdating} className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/40 backdrop-blur-sm shadow-md transition-transform hover:scale-110 border border-white/10" title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
              <svg className={`w-5 h-5 ${isWishlisted ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-white fill-transparent hover:text-yellow-200'}`} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </button>
          )}

          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center"><svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg></div>
          <Image src="/fox-placeholder.png" alt="Loading placeholder" width={80} height={120} className={`absolute object-contain z-10 transition-opacity duration-300 ${imageStatus === 'loaded' ? 'opacity-0' : 'opacity-100'}`} />
          {book.cover_image_url && book.cover_image_url !== 'UNAVAILABLE' && (
            <Image src={book.cover_image_url.replace('http:', 'https:')} alt={`Cover of ${book.title}`} fill sizes="128px" className={`absolute object-cover z-20 transition-opacity duration-500 ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setImageStatus('loaded')} onError={() => setImageStatus('error')} />
          )}
        </div>
        
        <h3 className="font-bold text-lg mb-1 leading-tight line-clamp-2 break-words w-full z-10" title={book.title}>{book.title}</h3>
        
        <button onClick={(e) => { e.stopPropagation(); if (onAuthorClick) onAuthorClick(book.author); }} className={`text-sm mb-2 line-clamp-1 break-words w-full z-10 hover:underline hover:text-sky-500 transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} title={`Search for more books by ${book.author}`}>{book.author}</button>

        <div className="flex flex-col items-center gap-1 mb-4 w-full z-10"><span className={`text-xs font-mono px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>ISBN: {book.isbn13}</span></div>
        
        <div className="mt-auto w-full pt-4 border-t border-gray-800/30 z-10 flex flex-col gap-3">
          {userId && (
            <button onClick={toggleLibrary} disabled={isUpdating} className={`w-full py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center ${isOwned ? 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800/50' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
              {isOwned ? (<><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> ON YOUR BOOKSHELF</>) : (<><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> Add to Bookshelf</>)}
            </button>
          )}

          {isOwned ? (
            <div className="text-xs font-mono text-emerald-500/70 mt-1">Purchase options hidden.</div>
          ) : isLoadingPrice ? (
            <div className="text-xs font-mono text-gray-500 animate-pulse py-2">Scanning vaults...</div>
          ) : (
            <div className="flex w-full gap-2 mt-1">
              <div className={`relative flex-grow rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
                <select value={selectedShopId} onChange={(e) => setSelectedShopId(e.target.value)} className="w-full h-full appearance-none bg-transparent pl-3 pr-8 py-2 text-xs font-bold focus:outline-none cursor-pointer">
                  {shops.map(shop => ( <option key={shop.id} value={shop.id} className={isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>{shop.name} - {shop.displayPrice}</option> ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></div>
              </div>
              <a href={currentShop.url} target="_blank" rel="noopener noreferrer" onClick={() => { ensureBookInDatabase(); fetch('/api/track', { method: 'POST', body: JSON.stringify({ event_type: 'affiliate_click', details: { shop: currentShop.id, book_title: book.title, target_url: currentShop.url } }) }); }} className="flex items-center justify-center shrink-0 bg-sky-600 hover:bg-sky-500 text-white p-2.5 rounded-lg transition-colors shadow-md w-10 h-10" title="Go to Store">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </a>
            </div>
          )}
        </div>
      </div>

      {isCoverModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) setIsCoverModalOpen(false); }}>
          <div className={`relative w-full max-w-sm rounded-3xl p-8 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-900 border border-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
            <button onClick={() => setIsCoverModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-red-500/80 text-white transition-colors z-30" title="Close Modal"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
            <div className={`relative w-48 h-72 md:w-56 md:h-80 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-6 border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-100'}`}>
              {book.cover_image_url && book.cover_image_url !== 'UNAVAILABLE' ? (
                <Image src={book.cover_image_url.replace('http:', 'https:')} alt={`Cover of ${book.title}`} fill sizes="256px" className="object-cover" />
              ) : (
                <Image src="/fox-placeholder.png" alt="Placeholder" fill sizes="256px" className="object-contain p-8" />
              )}
            </div>
            <h2 className="text-2xl font-black text-center mb-2 leading-tight drop-shadow-md">{book.title}</h2>
            <p className={`text-lg text-center mb-6 font-medium ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>{book.author}</p>
            <div className={`px-4 py-2 rounded-lg font-mono text-sm tracking-widest ${isDarkMode ? 'bg-gray-950 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>ISBN: <span className="font-bold text-white">{book.isbn13}</span></div>
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// 1.5 THE DYNAMIC BANNER CMS ENGINE
// ==========================================
function FeaturedBannerCarousel({ banners, onSelectBanner, isDarkMode }: { banners: Banner[], onSelectBanner: (banner: Banner) => void, isDarkMode: boolean }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!banners || banners.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-14 w-full relative group">
      <div className="relative w-full max-w-[1400px] mx-auto">
        <button onClick={() => scroll('left')} className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
        <button onClick={() => scroll('right')} className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
        
        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {banners.map(banner => (
            <div 
              key={banner.id} 
              onClick={() => onSelectBanner(banner)}
              className="snap-start shrink-0 w-[85vw] max-w-[400px] h-48 rounded-3xl p-6 md:p-8 flex items-center justify-between cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-2xl shadow-lg relative overflow-hidden group bg-gradient-to-br from-gray-800 to-gray-950"
            >
              {/* If no URL is provided, it falls back to the sleek dark gradient above */}
              {banner.background_image_url && (
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                  style={{ backgroundImage: `url(${banner.background_image_url})` }}
                ></div>
              )}
              
              <div 
                className={`relative z-10 w-full pr-4 drop-shadow-md ${!banner.text_color?.startsWith('#') ? (banner.text_color || 'text-white') : ''}`}
                style={banner.text_color?.startsWith('#') ? { color: banner.text_color } : undefined}
              >
                <h3 className="text-2xl md:text-3xl font-black mb-2 leading-tight drop-shadow-xl">{banner.title}</h3>
                <p className="text-sm font-medium leading-snug opacity-90 drop-shadow-lg">{banner.subtitle}</p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. THE CATEGORY VAULT ENGINE
// ==========================================
function CategoryVault({ title, books, isDarkMode, colorClass, onViewAll, userId, userLibrary, userWishlist, onAuthorClick }: { title: string, books: Book[], isDarkMode: boolean, colorClass: string, onViewAll: () => void, userId: string | null, userLibrary: string[], userWishlist: string[], onAuthorClick: (author: string) => void }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  if (books.length === 0) return null;

  return (
    <div className="mb-14 w-full relative group">
      <div className="flex justify-between items-end mb-6 px-8 max-w-7xl mx-auto">
        <h2 className={`text-2xl font-extrabold italic border-l-4 ${colorClass} pl-3 tracking-tight`}>{title}</h2>
        <button onClick={onViewAll} className={`text-sm font-bold flex items-center transition-all hover:translate-x-1 ${isDarkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-500'}`}>
          View All <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto">
        <button onClick={() => scroll('left')} className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
        <button onClick={() => scroll('right')} className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
        <div className={`absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l ${isDarkMode ? 'from-gray-950 to-transparent' : 'from-white to-transparent'} pointer-events-none`}></div>
        <div className={`absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r ${isDarkMode ? 'from-gray-950 to-transparent' : 'from-white to-transparent'} pointer-events-none`}></div>
        
        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {books.map(book => (
            <div key={book.id} className="snap-start shrink-0 w-72">
              <BookCard book={book} isDarkMode={isDarkMode} userId={userId} initiallyOwned={userLibrary.includes(book.id)} initiallyWishlisted={userWishlist.includes(book.id)} onAuthorClick={onAuthorClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. THE MAIN PAGE (Storefront HQ)
// ==========================================
export default function Home() {
  const { theme } = useTheme();
  
  // Connect the local boolean to the new global brain so the existing BookCards render correctly
  const isDarkMode = theme === 'dark' || theme === 'true-dark';

  // Upgraded Theme Styles featuring the beautiful Cream variation for Soft Light
  const themeStyles = {
    'light': 'bg-orange-50 text-stone-900', // This forces a warm, professional cream/parchment color
    'true-light': 'bg-white text-black',
    'dark': 'bg-gray-950 text-white',
    'true-dark': 'bg-black text-gray-300'
  }[theme];

  const [books, setBooks] = useState<Book[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasPressedEnter, setHasPressedEnter] = useState(false);
  
  const [apiSearchResults, setApiSearchResults] = useState<Book[]>([]); 
  const [isScanning, setIsScanning] = useState(false);
  const [searchOffset, setSearchOffset] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  // High-Level Views
  const [activeCategoryView, setActiveCategoryView] = useState<{name: string, books: Book[]} | null>(null);
  const [activeBannerView, setActiveBannerView] = useState<Banner | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userLibrary, setUserLibrary] = useState<string[]>([]);
  const [userWishlist, setUserWishlist] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/track', { method: 'POST', body: JSON.stringify({ event_type: 'page_visit', details: { path: '/', timestamp: new Date().toISOString() } }) }).catch(err => console.error("Tracking error", err));
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: bookData } = await supabase.from('books').select('*');
        if (bookData) setBooks(bookData);

        const { data: bannerData } = await supabase.from('storefront_banners').select('*').eq('is_published', true).order('created_at', { ascending: false });
        if (bannerData) setBanners(bannerData);

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          const { data: libraryData } = await supabase.from('user_libraries').select('book_id').eq('user_id', session.user.id);
          if (libraryData) setUserLibrary(libraryData.map(row => row.book_id));
          const { data: wishlistData } = await supabase.from('user_wishlists').select('book_id').eq('user_id', session.user.id);
          if (wishlistData) setUserWishlist(wishlistData.map(row => row.book_id));
        }
      } catch (err) { console.error("Critical Vault Error: ", err); } finally { setIsLoading(false); }
    }
    fetchData();
  }, []);

  const coreColors: Record<string, string> = { 'Fiction': 'border-purple-500', 'Non-Fiction': 'border-yellow-500', 'Horror': 'border-red-500', 'Learning / Educational': 'border-green-500' };
  const uniqueCategories = Array.from(new Set(books.map(b => b.category).filter(c => c && c !== 'General')));
  const dynamicCategories = uniqueCategories.map(catName => ({ name: catName, color: coreColors[catName] || 'border-sky-500' }));

  const getBooksForCategory = (categoryName: string) => books.filter(b => b.category === categoryName);

  const localSearchResults = books.filter((book) => {
    const queryLower = searchQuery.toLowerCase();
    const cleanQuery = queryLower.replace(/[- ]/g, '');
    const cleanIsbn = (book.isbn13 || '').replace(/[- ]/g, '');
    return book.title.toLowerCase().includes(queryLower) || book.author.toLowerCase().includes(queryLower) || (cleanIsbn !== '' && cleanIsbn.includes(cleanQuery));
  });

  const displayResults = hasPressedEnter ? apiSearchResults : localSearchResults;
  
  const executeSearch = async (queryToSearch: string | string[]) => {
    if (!queryToSearch || (Array.isArray(queryToSearch) && queryToSearch.length === 0) || (typeof queryToSearch === 'string' && !queryToSearch.trim())) return;
    setHasPressedEnter(true); 
    const displayQuery = Array.isArray(queryToSearch) ? queryToSearch.join(', ') : queryToSearch;
    setSearchQuery(displayQuery); 
    setIsLoading(true); 
    try {
      const queries = Array.isArray(queryToSearch) ? queryToSearch : [queryToSearch];
      const fetchPromises = queries.map(q => fetch(`/api/live-search?q=${encodeURIComponent(q)}`).then(res => res.json()));
      const resultsArray = await Promise.all(fetchPromises);
      let combinedBooks: Book[] = [];
      resultsArray.forEach(data => { if (data.success && data.books) combinedBooks = [...combinedBooks, ...data.books]; });
      const uniqueBooks = Array.from(new Map(combinedBooks.map(b => [b.isbn13, b])).values());
      if (uniqueBooks.length > 0) {
        setApiSearchResults(uniqueBooks); 
        const brandNewBooks = uniqueBooks.filter(newBook => !books.some(b => b.isbn13 === newBook.isbn13));
        setBooks(prevBooks => [...brandNewBooks, ...prevBooks]);
      } else { setApiSearchResults([]); }
    } catch (error) { console.error("Vault breach failed", error); }
    setIsLoading(false);
  };

  const handleLiveSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { await executeSearch(searchQuery); } };

  const handleLoadMore = async () => {
    setIsFetchingMore(true);
    const nextOffset = searchOffset + 10;
    setSearchOffset(nextOffset);
    try {
      const res = await fetch(`/api/live-search?q=${encodeURIComponent(searchQuery)}&offset=${nextOffset}`);
      const data = await res.json();
      if (data.success && data.books && data.books.length > 0) {
        if (data.books.length < 10) setHasMoreResults(false);
        setBooks(prevBooks => { const combined = [...prevBooks, ...data.books]; return Array.from(new Map(combined.map(b => [b.isbn13, b])).values()); });
        setApiSearchResults(prev => { const combined = [...prev, ...data.books]; return Array.from(new Map(combined.map(b => [b.isbn13, b])).values()); });
      } else { setHasMoreResults(false); }
    } catch (error) { console.error("DEBUG: Frontend error:", error); }
    setIsFetchingMore(false);
  };

  const handleAuthorClick = (authorName: string) => {
    setActiveCategoryView(null); setActiveBannerView(null);
    executeSearch(authorName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearViews = () => {
    setActiveCategoryView(null); setActiveBannerView(null); setSearchQuery(""); setHasPressedEnter(false); setApiSearchResults([]);
  };

  const loadBannerBooks = async (isbns: string[]) => {
    const cleanIsbns = isbns.map(i => i.replace(/[- ]/g, ''));
    const missingIsbns = cleanIsbns.filter(isbn => !books.some(b => (b.isbn13 || '').replace(/[- ]/g, '') === isbn));
    
    if (missingIsbns.length === 0) return; 
    
    setIsLoading(true);
    try {
      const fetchPromises = missingIsbns.map(isbn => fetch(`/api/live-search?q=${encodeURIComponent(isbn)}`).then(res => res.json()));
      const resultsArray = await Promise.all(fetchPromises);
      let newBooks: Book[] = [];
      resultsArray.forEach(data => { if (data.success && data.books && data.books.length > 0) newBooks.push(data.books[0]); });
      
      if (newBooks.length > 0) {
        setBooks(prevBooks => [...newBooks, ...prevBooks]);
      }
    } catch (error) {
      console.error("Failed to fetch missing banner books", error);
    }
    setIsLoading(false);
  };
  
  return (
<main className={`min-h-screen flex flex-col py-12 transition-colors duration-500 overflow-hidden ${themeStyles}`}>      <NotificationBell userId={userId} isDarkMode={isDarkMode} />
      <header className="flex justify-center items-center mb-12 w-full relative">
        <button onClick={handleClearViews} className="hover:opacity-80 transition-opacity">
          <h1 className="flex items-baseline font-extrabold tracking-tighter">
            <span className="text-4xl lowercase">book</span>
            <span className="relative mx-1 text-5xl text-sky-400 italic inline-block px-1">
              Hyper
              <span className={`absolute left-0 right-0 h-[4px] top-[54%] -translate-y-1/2 ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}></span>
            </span>
            <span className="text-4xl lowercase">-market</span>
          </h1>
        </button>
      </header>

      {/* VIEW: BANNER LANDING PAGE */}
      {activeBannerView ? (
        <div className="w-full relative z-10 max-w-7xl mx-auto px-6 animate-in fade-in duration-500">
          <div className="flex flex-col mb-12">
            <button onClick={() => setActiveBannerView(null)} className={`self-start mb-6 px-4 py-2 rounded-full font-bold text-sm flex items-center transition-all hover:-translate-x-1 ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back
            </button>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-sky-400">{activeBannerView.title}</h2>
            {activeBannerView.landing_page_text && (
              <p className={`text-xl max-w-3xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {activeBannerView.landing_page_text}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books
              .filter(b => b.isbn13 && activeBannerView.target_isbns.map(i => i.replace(/[- ]/g, '')).includes(b.isbn13.replace(/[- ]/g, '')))
              .map(book => (
                <BookCard key={book.id} book={book} isDarkMode={isDarkMode} userId={userId} initiallyOwned={userLibrary.includes(book.id)} initiallyWishlisted={userWishlist.includes(book.id)} onAuthorClick={handleAuthorClick} />
            ))}
          </div>
        </div>
      ) : activeCategoryView ? (
        /* VIEW: CATEGORY EXPANDED */
        <div className="w-full relative z-10 max-w-7xl mx-auto px-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 border-gray-800">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 md:mb-0">{activeCategoryView.name}</h2>
            <button onClick={() => setActiveCategoryView(null)} className={`px-6 py-2 rounded-full font-bold flex items-center transition-all hover:-translate-x-1 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Storefront
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeCategoryView.books.map(book => <BookCard key={book.id} book={book} isDarkMode={isDarkMode} userId={userId} initiallyOwned={userLibrary.includes(book.id)} initiallyWishlisted={userWishlist.includes(book.id)} onAuthorClick={handleAuthorClick} />)}
          </div>
        </div>
      ) : (
        /* VIEW: MAIN STOREFRONT OR SEARCH */
        <>
          <div className="w-full mb-12 flex flex-col items-center gap-6 px-4">
            <div className="w-full max-w-2xl relative z-20">
              <input type="text" placeholder="Search entire vault... (Press Enter to scour global databases)" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setHasPressedEnter(false); }} onKeyDown={handleLiveSearch} className={`w-full p-4 pr-16 rounded-xl border text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xl ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
              <button onClick={() => setIsScanning(true)} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-sky-400 hover:bg-gray-800' : 'text-gray-500 hover:text-sky-600 hover:bg-gray-200'}`} title="Scan Barcode"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5v3a1 1 0 01-2 0V4zm14-1a1 1 0 011 1v3a1 1 0 01-2 0V5h-3a1 1 0 010-2h4zM3 20a1 1 0 001 1h4a1 1 0 000-2H5v-3a1 1 0 00-2 0v4zm14 1a1 1 0 001-1v-3a1 1 0 00-2 0v3h-3a1 1 0 000 2h4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h8v4H8z" /></svg></button>
            </div>
            {isScanning && ( <BarcodeScanner onClose={() => setIsScanning(false)} onScanSuccess={(isbn) => { setIsScanning(false); executeSearch(isbn); }} /> )}
          </div>

          <div className="w-full relative z-10">
            {isLoading ? (
              <div className="text-center py-12 text-sky-400 animate-pulse font-mono">[ Syncing Database... ]</div>
            ) : searchQuery ? (
              <div className="flex flex-col items-center pb-12 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-6 w-full">
                  {displayResults.length === 0 ? (
                    hasPressedEnter ? (
                      <div className="col-span-full flex flex-col items-center justify-center p-12 opacity-70">
                        <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-xl font-bold">No results found anywhere.</p>
                        <p className="text-sm font-mono mt-2">Try adjusting your spelling or checking the ISBN.</p>
                      </div>
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center p-12">
                         <p className="text-sky-500 font-bold animate-pulse text-lg tracking-wide">[ Press Enter to search external vaults... ]</p>
                      </div>
                    )
                  ) : (
                    displayResults.map(book => <BookCard key={book.id} book={book} isDarkMode={isDarkMode} userId={userId} initiallyOwned={userLibrary.includes(book.id)} initiallyWishlisted={userWishlist.includes(book.id)} onAuthorClick={handleAuthorClick} />)
                  )}
                </div>
                {displayResults.length > 0 && hasPressedEnter && (
                  <div className="mt-12">
                    {hasMoreResults ? (
                      <button onClick={handleLoadMore} disabled={isFetchingMore} className={`px-8 py-3 rounded-full font-bold transition-all flex items-center shadow-lg ${isDarkMode ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-sky-500 hover:bg-sky-400 text-white'} ${isFetchingMore ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}>
                        {isFetchingMore ? '[ EXCAVATING VAULT... ]' : 'Load More Results'}
                      </button>
                    ) : (
                      <div className={`px-8 py-3 rounded-full font-mono text-sm border ${isDarkMode ? 'border-gray-800 text-gray-500 bg-gray-900/50' : 'border-gray-300 text-gray-500 bg-gray-100/50'}`}>[ ALL ENTRIES LOADED ]</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* SLOT 1: Top of the Page */}
                <FeaturedBannerCarousel 
                  banners={banners.filter(b => b.slot_position === 1 || !b.slot_position)}
                  onSelectBanner={(banner) => {
                    setActiveBannerView(banner);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    loadBannerBooks(banner.target_isbns);
                  }} 
                  isDarkMode={isDarkMode} 
                />

                {/* THE SCHOLASTIC SPOTLIGHT CAROUSEL INJECTION */}
                <ScholasticCarousel isDarkMode={isDarkMode} />

                {dynamicCategories.map((cat, index) => {
                  const catBooks = getBooksForCategory(cat.name);
                  return (
                    <div key={cat.name}>
                      <CategoryVault title={cat.name} books={catBooks} isDarkMode={isDarkMode} colorClass={cat.color} onViewAll={() => setActiveCategoryView({ name: cat.name, books: catBooks })} userId={userId} userLibrary={userLibrary} userWishlist={userWishlist} onAuthorClick={handleAuthorClick} />
                      
                      {/* SLOT 2: Injected after the 2nd Category */}
                      {index === 1 && (
                        <FeaturedBannerCarousel banners={banners.filter(b => b.slot_position === 2)} onSelectBanner={(banner) => { setActiveBannerView(banner); window.scrollTo({ top: 0, behavior: 'smooth' }); loadBannerBooks(banner.target_isbns); }} isDarkMode={isDarkMode} />
                      )}

                      {/* SLOT 3: Injected after the 4th Category */}
                      {index === 3 && (
                        <FeaturedBannerCarousel banners={banners.filter(b => b.slot_position === 3)} onSelectBanner={(banner) => { setActiveBannerView(banner); window.scrollTo({ top: 0, behavior: 'smooth' }); loadBannerBooks(banner.target_isbns); }} isDarkMode={isDarkMode} />
                      )}

                      {/* SLOT 4: Injected after the 6th Category */}
                      {index === 5 && (
                        <FeaturedBannerCarousel banners={banners.filter(b => b.slot_position === 4)} onSelectBanner={(banner) => { setActiveBannerView(banner); window.scrollTo({ top: 0, behavior: 'smooth' }); loadBannerBooks(banner.target_isbns); }} isDarkMode={isDarkMode} />
                      )}
                    </div>
                  )
                })}

                <CategoryVault title="All Inventory" books={books} isDarkMode={isDarkMode} colorClass="border-gray-500" onViewAll={() => setActiveCategoryView({ name: 'All Inventory', books: books })} userId={userId} userLibrary={userLibrary} userWishlist={userWishlist} onAuthorClick={handleAuthorClick} />
              </>
            )}
          </div>
        </>
      )}

      <FloatingMenu />
      <SpeedInsights />
    </main>
  );
}