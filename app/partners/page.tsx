'use client';

import { useState } from 'react';
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
      { id: 'm-2', title: 'Gift Cards', description: 'For birthdays, thank-yous, holidays, or just because, a MORiSH voucher is the perfect gift for any moment. Let them choose their faves from a mouth-watering range of Snacks With Benefits.', link: 'https://tidd.ly/4vWOBTZ', isMain: false },
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
    logoPath: '/logos/scholastic.svg',
    color: 'from-red-600 to-red-800', 
    items: [
      { id: 's-main', title: 'Scholastic Home Page', description: 'Explore the full catalog of beloved titles.', link: 'https://tidd.ly/3QUpTEV', isMain: true },
      { id: 's-1', title: 'Children\'s Books', description: 'Discover the magic with stunning box sets.', link: 'https://tidd.ly/4uFR1Fv', isMain: false },
      { id: 's-2', title: 'Learning Home', description: 'Curriculum-aligned learning materials.', link: 'https://tidd.ly/4oHoSN8', isMain: false },
      { id: 's-3', title: 'Sale', description: 'Amazing Books Starting At Just £1!', link: 'https://tidd.ly/4aSs96f', isMain: false }
    ]
  }
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen flex flex-col py-12 px-8 bg-gray-950 text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="px-6 py-2 rounded-lg text-sm font-bold bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-colors shadow-md flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Storefront
          </Link>
        </div>

        <div className="text-center mb-16 animate-in fade-in zoom-in-95 duration-500">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-sky-400">Trusted Partners</h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-400 leading-relaxed">
            We team up with industry-leading brands to bring you the best books, the fastest delivery, and the finest reading snacks.
          </p>
        </div>

        <div className="flex flex-col gap-24">
          {partners.map(partner => (
            <div key={partner.id} className="flex flex-col relative group/section">
              <div className="flex items-center gap-6 mb-8 px-4">
                <div className="w-20 h-20 bg-black border border-gray-800 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden p-3 flex-shrink-0">
                  <Image src={partner.logoPath} alt={partner.name} fill style={{ objectFit: 'contain', padding: '0.4rem' }} />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white">{partner.name}</h2>
                  <p className="text-gray-400 text-lg mt-1">{partner.description}</p>
                </div>
              </div>

              {/* Navigation Arrows Container */}
              <div className="relative px-4">
                <div className="flex overflow-hidden gap-6 pb-6">
                   {/* We use a grid that limits visible items to 3 on desktop */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    {partner.items.map(item => (
                      <div key={item.id} className={`rounded-3xl p-8 flex flex-col relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${item.isMain ? 'bg-gray-900 border-2 border-gray-700' : 'bg-gray-900/40 border border-gray-800'}`}>
                        {item.isMain && <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${partner.color}`} />}
                        <div className="flex-grow">
                          <h3 className={`text-2xl font-bold mb-4 ${item.isMain ? 'text-white' : 'text-gray-200'}`}>{item.title}</h3>
                          <p className="text-gray-400 leading-relaxed mb-8">{item.description}</p>
                        </div>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className={`w-full py-4 rounded-2xl font-bold text-center text-white shadow-lg transition-all ${item.isMain ? `bg-gradient-to-r ${partner.color} hover:brightness-110` : 'bg-gray-800 hover:bg-gray-700'}`}>
                          {item.isMain ? 'Visit Main Store' : 'Shop Now'}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pagination Indicators - Rectangles */}
                <div className="flex gap-2 justify-center mt-8">
                  {partner.items.map((_, i) => (
                    <div key={partner.id + i} className={`h-1.5 w-12 rounded-full transition-all duration-300 ${i === 0 ? 'bg-sky-500 w-16' : 'bg-gray-800'}`} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}