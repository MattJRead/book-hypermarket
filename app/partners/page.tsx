'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
      { id: 'm-2', title: 'Beef & Pork Snacks', description: 'Protein-packed savory snacks for long reading nights.', link: 'https://tidd.ly/3SP0JIi', isMain: false },
      { id: 'm-3', title: 'Shop All Morish', description: 'Explore every delicious flavor and snack option.', link: 'https://tidd.ly/3SP0JIi', isMain: false }
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
    id: 'scholastic',
    name: 'Scholastic',
    description: 'The global leader in children\'s publishing and educational materials.',
    logoPath: '/logos/scholastic.png',
    color: 'from-red-600 to-red-800', 
    items: [
      { id: 's-main', title: 'Scholastic Home Page', description: 'Explore the full catalog of beloved titles.', link: 'https://tidd.ly/3QUpTEV', isMain: true },
      { id: 's-1', title: 'Children\'s Books', description: 'Discover the magic with stunning box sets.', link: 'https://tidd.ly/4uFR1Fv', isMain: false },
      { id: 's-2', title: 'Learning Home', description: 'Curriculum-aligned learning materials.', link: 'https://tidd.ly/4oHoSN8', isMain: false },
      { id: 's-3', title: 'YA Bestsellers', description: 'Gripping Young Adult thrillers and fantasies.', link: 'https://tidd.ly/4uFR1Fv', isMain: false }
    ]
  }
];

export default function PartnersPage() {
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scroll = (id: string, direction: 'left' | 'right') => {
    const el = scrollRefs.current[id];
    if (el) {
      const scrollAmount = el.clientWidth * 0.8;
      el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen flex flex-col py-12 bg-gray-950 text-white selection:bg-sky-500/30">
      <div className="max-w-7xl mx-auto w-full px-8">
        <Link href="/" className="inline-flex items-center px-6 py-2 rounded-xl text-sm font-bold bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all mb-12 group">
          <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Storefront
        </Link>

        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">Trusted Partners</h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-400 font-medium">Premium brands and essential services curated for the modern reader.</p>
        </div>
      </div>

      <div className="flex flex-col gap-24">
        {partners.map(partner => (
          <div key={partner.id} className="group/section">
            <div className="max-w-7xl mx-auto px-8 mb-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-black border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden p-3 shrink-0">
                  <Image src={partner.logoPath} alt={partner.name} fill style={{ objectFit: 'contain', padding: '0.4rem' }} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{partner.name}</h2>
                  <p className="text-gray-500 font-medium">{partner.description}</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              {/* Desktop Navigation Arrows */}
              <button 
                onClick={() => scroll(partner.id, 'left')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-24 bg-black/80 backdrop-blur-md border border-gray-800 rounded-xl items-center justify-center hidden md:flex hover:bg-gray-800 transition-all active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              </button>

              <button 
                onClick={() => scroll(partner.id, 'right')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-24 bg-black/80 backdrop-blur-md border border-gray-800 rounded-xl items-center justify-center hidden md:flex hover:bg-gray-800 transition-all active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </button>

              {/* Scroll Container */}
              <div 
                ref={(el) => { scrollRefs.current[partner.id] = el; }}
                className="flex overflow-x-auto gap-6 px-8 md:px-[calc((100vw-1280px)/2+32px)] scrollbar-hide snap-x snap-mandatory"
                style={{ scrollPadding: '2rem' }}
              >
                {partner.items.map(item => (
                  <div key={item.id} className={`snap-start shrink-0 w-[85vw] md:w-[400px] rounded-[2rem] p-8 flex flex-col relative overflow-hidden transition-all duration-500 hover:ring-2 hover:ring-gray-700 ${item.isMain ? 'bg-gray-900 border border-gray-800' : 'bg-gray-900/30 border border-gray-900'}`}>
                    {item.isMain && <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${partner.color}`} />}
                    
                    <div className="flex-grow">
                      <h3 className={`text-2xl font-bold mb-4 ${item.isMain ? 'text-white' : 'text-gray-300'}`}>{item.title}</h3>
                      <p className="text-gray-500 font-medium leading-relaxed mb-10">{item.description}</p>
                    </div>

                    <a href={item.link} target="_blank" rel="noopener noreferrer" className={`w-full py-4 rounded-2xl font-bold text-center text-white transition-all ${item.isMain ? `bg-gradient-to-r ${partner.color} shadow-lg shadow-orange-500/10` : 'bg-gray-800 hover:bg-gray-700'}`}>
                      {item.isMain ? 'Visit Official Store' : 'Shop Product'}
                    </a>
                  </div>
                ))}
                {/* Invisible Spacer for End of Scroll */}
                <div className="shrink-0 w-8 md:w-32" />
              </div>

              {/* Steam-Style Progress Indicator */}
              <div className="flex gap-2 justify-center mt-10">
                {partner.items.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === 0 ? 'bg-sky-500 w-12' : 'bg-gray-800 w-8'}`} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </main>
  );
}