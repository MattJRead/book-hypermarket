'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FloatingMenu from '@/components/FloatingMenu';
import { useTheme } from '@/components/ThemeProvider'; // Added the import

const partners = [
  {
    id: 'morish',
    name: 'Morish Snacks',
    description: 'The perfect reading companion. Premium snacks to elevate your next reading session.',
    logoPath: '/logos/morish.png',
    color: 'from-amber-500 to-orange-600',
    items: [
      { id: 'm-main', title: 'Morish Snacks Store', description: 'Shop the full award-winning range.', link: 'https://tidd.ly/3SzzUYy', isMain: true },
      { id: 'm-1', title: 'Seaweed Snacks', description: 'A savory, plant-based treat for your reading sessions.', link: 'https://tidd.ly/4fVPnfh', isMain: false },
      { id: 'm-2', title: 'Gift Cards', description: 'For birthdays, thank-yous, holidays, or just because, a MORiSH voucher is the perfect gift.', link: 'https://tidd.ly/4vWOBTZ', isMain: false },
      { id: 'm-3', title: 'Shop All Morish', description: 'Explore every delicious flavor and snack option.', link: 'https://tidd.ly/3SP0JIi', isMain: false }
    ]
  },
  {
    id: 'scholastic',
    name: 'Scholastic',
    description: 'The global leader in children\'s publishing and educational materials.',
    logoPath: '/logos/scholastic.svg',
    color: 'from-red-600 to-red-800', 
    items: [
      { id: 's-main', title: 'Scholastic Home Page', description: 'Explore the full catalog of beloved titles.', link: 'https://tidd.ly/3QUpTEV', isMain: true },
      { id: 's-1', title: 'Children\'s Books', description: 'Discover the magic with stunning box sets.', link: 'https://tidd.ly/4uFR1Fv', isMain: false },
      { id: 's-2', title: 'Learning Home', description: 'Curriculum-aligned learning materials.', link: 'https://tidd.ly/4oHoSN8', isMain: false },
      { id: 's-3', title: 'Sale', description: 'Amazing Books Starting At Just £1!', link: 'https://tidd.ly/4aSs96f', isMain: false }
    ]
  },
  {
    id: 'ebay',
    name: 'eBay',
    description: 'The ultimate vault for rare, vintage, and second-hand editions.',
    logoPath: '/logos/ebay.png',
    color: 'from-red-500 to-rose-600',
    items: [
      { id: 'e-main', title: 'eBay Vault', description: 'Hunt down hidden literary gems and rare prints.', link: 'https://ebay.us/jQjfSJ', isMain: true },
      { id: 'e-1', title: 'First Edition Books', description: 'Invest in classic, highly collectible first printings.', link: 'https://ebay.us/NDSTES', isMain: false },
      { id: 'e-2', title: 'Vintage Sci-Fi', description: 'Classic pulp paperbacks and retro cover art.', link: 'https://ebay.us/Ozas0G', isMain: false },
      { id: 'e-3', title: 'Wholesale Book Bundles', description: 'Buy pre-loved books in bulk by the kilogram.', link: 'https://ebay.us/qhu1eJ', isMain: false }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Our global fulfillment partner. Access millions of titles and accessories.',
    logoPath: '/logos/amazon.png',
    color: 'from-sky-500 to-blue-600',
    items: [
      { id: 'a-main', title: 'Amazon Books', description: 'Search millions of titles with lightning fast delivery.', link: 'https://www.amazon.co.uk/?tag=bookhypermarket-21', isMain: true },
      { id: 'a-1', title: 'Kindle E-Readers', description: 'Carry your entire library wherever you go.', link: 'https://amzn.to/44mJeBD', isMain: false },
      { id: 'a-2', title: 'Reading Lights', description: 'Perfect illumination for reading in bed.', link: 'https://amzn.to/4oxCKsW', isMain: false },
      { id: 'a-3', title: 'Bookshelves', description: 'Organize and display your library beautifully.', link: 'https://amzn.to/4xBMJlk', isMain: false }
  ]
  }
];


// We pass isDarkUI into the component so the cards know how to render
function PartnerRow({ partner, isDarkUI }: { partner: typeof partners[0], isDarkUI: boolean }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeDot, setActiveDot] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (el) {
      const scrollAmount = 324; // Card width + gap
      const maxScroll = el.scrollWidth - el.clientWidth;
      
      if (direction === 'right') {
        if (el.scrollLeft >= maxScroll - 10) {
          // If at the end, rewind to start
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
        if (el.scrollLeft <= 0) {
          // If at the start, jump to end
          el.scrollTo({ left: maxScroll, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    }
  };

  const handleScrollEvent = () => {
    const el = scrollRef.current;
    if (el) {
      const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
      const newDot = Math.round(progress * (partner.items.length - 1));
      setActiveDot(newDot || 0);
    }
  };

  return (
    <div className="w-full max-w-[1000px] group/section flex flex-col items-center">
      <div className="w-full max-w-[948px] px-2 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-black border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden p-3 shrink-0">
            <Image src={partner.logoPath} alt={partner.name} fill style={{ objectFit: 'contain', padding: '0.4rem' }} />
          </div>
          <div>
            <h2 className={`text-3xl font-bold tracking-tight ${isDarkUI ? 'text-white' : 'text-gray-900'}`}>{partner.name}</h2>
            <p className={`font-medium ${isDarkUI ? 'text-gray-500' : 'text-gray-600'}`}>{partner.description}</p>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[1000px] px-6 group">
        <button 
          onClick={() => scroll('left')}
          className={`absolute left-0 top-[40%] -translate-y-1/2 z-20 w-12 h-20 border rounded-xl items-center justify-center hidden md:flex transition-all active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 ${isDarkUI ? 'bg-black border-gray-700 hover:bg-gray-800 text-white' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-900'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button 
          onClick={() => scroll('right')}
          className={`absolute right-0 top-[40%] -translate-y-1/2 z-20 w-12 h-20 border rounded-xl items-center justify-center hidden md:flex transition-all active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 ${isDarkUI ? 'bg-black border-gray-700 hover:bg-gray-800 text-white' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-900'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
        </button>

        <div 
          ref={scrollRef}
          onScroll={handleScrollEvent}
          className="flex overflow-x-auto gap-6 mx-auto w-full max-w-[948px] scrollbar-hide snap-x snap-mandatory py-4"
        >
          {partner.items.map(item => (
            <div key={item.id} className={`snap-start shrink-0 w-[280px] md:w-[300px] rounded-[1.5rem] p-6 flex flex-col relative overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-gray-700 shadow-xl border ${item.isMain ? (isDarkUI ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300') : (isDarkUI ? 'bg-gray-900/40 border-gray-800' : 'bg-gray-50 border-gray-200')}`}>
              {item.isMain && <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${partner.color}`} />}
              <div className="flex-grow">
                <h3 className={`text-xl font-bold mb-3 ${item.isMain ? (isDarkUI ? 'text-white' : 'text-gray-900') : (isDarkUI ? 'text-gray-300' : 'text-gray-700')}`}>{item.title}</h3>
                <p className={`text-sm font-medium leading-relaxed mb-8 ${isDarkUI ? 'text-gray-500' : 'text-gray-600'}`}>{item.description}</p>
              </div>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className={`w-full py-3 rounded-xl font-bold text-sm text-center text-white transition-all ${item.isMain ? `bg-gradient-to-r ${partner.color} shadow-lg shadow-orange-500/10` : 'bg-gray-800 hover:bg-gray-700'}`}>
                {item.isMain ? 'Visit Official Store' : 'Shop Product'}
              </a>
            </div>
          ))}
        </div>

        {/* Progress Rectangles */}
        <div className="flex gap-2 justify-center mt-4">
          {partner.items.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeDot ? 'bg-sky-500 w-12' : (isDarkUI ? 'bg-gray-800 w-8' : 'bg-gray-300 w-8')}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PartnersPage() {
  
  // The hook MUST go here, inside the main page function!
  const { theme } = useTheme();
  
  // High-level check for the components
  const isDarkUI = theme === 'dark' || theme === 'true-dark';

  // The 4-tier theme system, complete with the warm Cream for Soft Light
  const themeStyles = {
    'light': 'bg-orange-50 text-stone-900', // Beautiful Reader's Cream
    'true-light': 'bg-white text-black',
    'dark': 'bg-gray-950 text-white',
    'true-dark': 'bg-black text-gray-300'
  }[theme];

  return (
     <main className="min-h-screen flex flex-col py-12">
        <div className="max-w-[1000px] mx-auto w-full px-4">
        <Link href="/" className={`inline-flex items-center px-6 py-2 rounded-xl text-sm font-bold border transition-all mb-12 group ${isDarkUI ? 'bg-gray-900 border-gray-800 hover:border-gray-600 text-white' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-900'}`}>
          <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Storefront
        </Link>

        <div className="text-center mb-20">
          <h1 className={`text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-b bg-clip-text text-transparent ${isDarkUI ? 'from-white to-gray-500' : 'from-gray-900 to-gray-500'}`}>Trusted Partners</h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto font-medium ${isDarkUI ? 'text-gray-400' : 'text-gray-600'}`}>Premium brands and essential services curated for the modern reader.</p>
        </div>
      </div>

      <div className="flex flex-col gap-24 items-center mb-32">
        {partners.map(partner => (
          <PartnerRow key={partner.id} partner={partner} isDarkUI={isDarkUI} />
        ))}
      </div>

      <FloatingMenu />

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </main>
  );
}