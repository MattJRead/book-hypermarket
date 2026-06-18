'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// The Master Affiliates Database
const partners = [
  {
    id: 'morish',
    name: 'Morish Snacks',
    description: 'The perfect reading companion. Premium snacks to elevate your next reading session.',
    logoPath: '/logos/morish.png',
    color: 'from-amber-500 to-orange-600',
    items: [
      {
        id: 'm-main',
        title: 'Morish Snacks Store',
        description: 'Shop the full award-winning range.',
        link: 'https://tidd.ly/3SzzUYy',
        isMain: true
      },
      {
        id: 'm-1',
        title: 'Seaweed Snacks',
        description: 'A savory, plant-based treat for your reading sessions.',
        link: 'https://tidd.ly/4fVPnfh', 
        isMain: false
      },
      {
        id: 'm-2',
        title: 'Shop All Morish',
        description: 'Explore every delicious flavor and snack option.',
        link: 'https://tidd.ly/3SP0JIi', 
        isMain: false
      }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Our global fulfillment partner. Access millions of titles and reading accessories.',
    logoPath: '/logos/amazon.png',
    color: 'from-sky-500 to-blue-600',
    items: [
      {
        id: 'a-main',
        title: 'Amazon Books',
        description: 'Search millions of titles with lightning fast delivery.',
        link: 'https://www.amazon.co.uk/?tag=bookhypermarket-21',
        isMain: true
      },
      {
        id: 'a-1',
        title: 'Kindle E-Readers',
        description: 'Carry your entire library wherever you go.',
        link: 'https://amzn.to/44mJeBD', 
        isMain: false
      },
      {
        id: 'a-2',
        title: 'Reading Lights',
        description: 'Perfect illumination for reading in bed.',
        link: 'https://amzn.to/4oxCKsW', 
        isMain: false
      },
      {
        id: 'a-3',
        title: 'Bookshelves',
        description: 'Organize and display your growing library beautifully.',
        link: 'https://amzn.to/4xBMJlk', 
        isMain: false
      }
    ]
  },
  {
    id: 'ebay',
    name: 'eBay',
    description: 'The ultimate vault for rare, vintage, and second-hand editions.',
    logoPath: '/logos/ebay.png',
    color: 'from-red-500 to-rose-600',
    items: [
      {
        id: 'e-main',
        title: 'eBay Vault',
        description: 'Hunt down hidden literary gems and rare prints.',
        link: 'https://ebay.us/jQjfSJ',
        isMain: true
      },
      {
        id: 'e-1',
        title: 'First Edition Books',
        description: 'Invest in classic, highly collectible first printings.',
        link: 'https://ebay.us/NDSTES', 
        isMain: false
      },
      {
        id: 'e-2',
        title: 'Vintage Sci-Fi',
        description: 'Classic pulp paperbacks and retro cover art.',
        link: 'https://ebay.us/Ozas0G', 
        isMain: false
      },
      {
        id: 'e-3',
        title: 'Wholesale Book Bundles',
        description: 'Buy pre-loved books in bulk by the kilogram.',
        link: 'https://ebay.us/qhu1eJ', 
        isMain: false
      }
    ]
  },
  {
    id: 'scholastic',
    name: 'Scholastic',
    description: 'The global leader in children\'s publishing and educational materials.',
    logoPath: '/logos/scholastic.png',
    color: 'from-red-600 to-red-800', 
    items: [
      {
        id: 's-main',
        title: 'Scholastic Home Page',
        description: 'Explore the full catalog of beloved children\'s and YA titles.',
        link: 'https://tidd.ly/3QUpTEV',
        isMain: true
      },
      {
        id: 's-1',
        title: 'Scholastic Children\'s Books',
        description: 'Discover the magic with stunning box sets and illustrated editions.',
        link: 'https://tidd.ly/4uFR1Fv', 
        isMain: false
      },
      {
        id: 's-2',
        title: 'Learning Home',
        description: 'Curriculum-aligned learning materials for all reading levels.',
        link: 'https://tidd.ly/4oHoSN8', 
        isMain: false
      }
    ]
  }
];

export default function PartnersPage() {
  const [isDarkMode] = useState(true);

  return (
    <main className={`min-h-screen flex flex-col py-12 px-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto w-full">
        
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
            We team up with industry-leading brands to bring you the best books, the fastest delivery, and the finest reading snacks. Support the hypermarket by shopping through our official partners below.
          </p>
        </div>

        {/* Partner Carousels */}
        <div className="flex flex-col gap-16">
          {partners.map(partner => (
            <div key={partner.id} className="flex flex-col">
              
              {/* Partner Header */}
              <div className="flex items-center gap-6 mb-6 px-2">
                <div className="w-16 h-16 bg-black border border-gray-800 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden p-2 flex-shrink-0">
                  <Image 
                    src={partner.logoPath} 
                    alt={`${partner.name} Logo`} 
                    fill
                    style={{ objectFit: 'contain', padding: '0.25rem' }}
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{partner.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">{partner.description}</p>
                </div>
              </div>

              {/* Horizontal Scroll Container */}
              <div className="flex overflow-x-auto pb-8 pt-4 px-2 -mx-2 gap-6 snap-x snap-mandatory hide-scrollbar">
                {partner.items.map(item => (
                  <div 
                    key={item.id} 
                    className={`snap-start shrink-0 w-72 md:w-80 rounded-2xl p-6 flex flex-col relative overflow-hidden group transition-transform hover:-translate-y-2 hover:shadow-2xl ${item.isMain ? 'bg-gray-900 border border-gray-700' : 'bg-gray-900/50 border border-gray-800'}`}
                  >
                    {/* Top Glow for Main Cards */}
                    {item.isMain && (
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${partner.color}`}></div>
                    )}
                    
                    <div className="flex-grow">
                      <h3 className={`text-xl font-bold mb-3 ${item.isMain ? 'text-white' : 'text-gray-200'}`}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-6">
                        {item.description}
                      </p>
                    </div>

                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-center text-white shadow-lg transition-all ${item.isMain ? `bg-gradient-to-r ${partner.color} opacity-90 hover:opacity-100` : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                      {item.isMain ? 'Visit Main Store' : 'Shop Now'}
                    </a>
                  </div>
                ))}
              </div>
              
            </div>
          ))}
        </div>

      </div>
      
      {/* CSS to hide the scrollbar but keep functionality */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </main>
  );
}