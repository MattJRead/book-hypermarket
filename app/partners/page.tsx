'use client';

import { useState } from 'react';
import Link from 'next/link';

// Your Official Affiliates Database
const partners = [
  {
    id: 'morish',
    name: 'Morish Snacks',
    description: 'The perfect reading companion. Premium, award-winning savory snacks to elevate your next reading session.',
    affiliateLink: 'https://www.awin1.com/cread.php?awinmid=126437&awinaffid=2934999&clickref=Partners+Page&ued=https%3A%2F%2Fmorishsnacks.co.uk%2F%3Fsrsltid%3DAfmBOoo5gY2rYiCdOv5nQnAL8aRhbxSrzMQvXnjE8UQuqbZbWOrWHhlh',
    color: 'from-amber-500 to-orange-600',
    buttonText: 'Shop Morish Snacks'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Our global fulfillment partner. Access millions of titles with lightning fast delivery across the world.',
    affiliateLink: 'https://www.amazon.co.uk/?tag=bookhypermarket-21', 
    color: 'from-sky-500 to-blue-600',
    buttonText: 'Shop on Amazon'
  },
  {
    id: 'ebay',
    name: 'eBay',
    description: 'The ultimate vault for rare, vintage, and second hand editions. Discover hidden literary gems.',
    affiliateLink: 'https://ebay.us/jQjfSJ', 
    color: 'from-red-500 to-rose-600',
    buttonText: 'Hunt on eBay'
  }
];

export default function PartnersPage() {
  const [isDarkMode] = useState(true);

  return (
    <main className={`min-h-screen flex flex-col py-12 px-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="px-6 py-2 rounded-lg text-sm font-bold bg-gray-800 hover:bg-gray-700 transition-colors shadow-md flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Storefront
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in zoom-in-95 duration-500">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 text-sky-400">Trusted Partners</h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-400 leading-relaxed">
            We team up with industry leading brands to bring you the best books, the fastest delivery, and the finest reading snacks. Support the hypermarket by shopping through our official partners below.
          </p>
        </div>

        {/* Partner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map(partner => (
            <div key={partner.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-2 hover:shadow-2xl hover:border-gray-600 relative overflow-hidden group">
              
              {/* Dynamic Top Glow Line */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${partner.color}`}></div>
              
              {/* Logo Box Placeholder */}
              <div className="w-24 h-24 bg-black border border-gray-800 rounded-2xl mb-6 flex items-center justify-center shadow-inner relative overflow-hidden">
                <span className="text-xs text-gray-600 font-mono">LOGO</span>
              </div>

              <h2 className="text-2xl font-bold mb-3 text-white">{partner.name}</h2>
              <p className="text-sm text-gray-400 mb-8 flex-grow">{partner.description}</p>

              <a 
                href={partner.affiliateLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`w-full py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${partner.color} opacity-90 hover:opacity-100 transition-opacity shadow-lg`}
              >
                {partner.buttonText}
              </a>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}