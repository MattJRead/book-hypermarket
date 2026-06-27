'use client';

import { useRef } from 'react';

type PartnerBanner = {
  id: string;
  title: string;
  description: string;
  link: string;
  brandName: string;
  brandColor: string;
};

export default function PartnerCarousel({ title, banners, isDarkMode }: { title: string, banners: PartnerBanner[], isDarkMode: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full max-w-[1000px] mx-auto mt-12 mb-12 px-4 relative group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
      </div>
      
      <div className="relative w-full">
        <button onClick={() => scroll('left')} className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 -ml-4 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
        <button onClick={() => scroll('right')} className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 -mr-4 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>

        <div ref={scrollRef} className="flex overflow-x-auto gap-6 snap-x snap-mandatory py-4 px-2 -mx-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {banners.map((item) => (
            <a 
              key={item.id} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`snap-start shrink-0 w-[260px] md:w-[280px] rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border group ${!isDarkMode ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-900 border-gray-800'}`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${item.brandColor}`} />
              <h3 className={`text-xl font-bold mb-2 transition-colors ${!isDarkMode ? 'text-gray-900' : 'text-white'}`}>
                {item.title}
              </h3>
              <p className={`text-sm flex-grow leading-relaxed ${!isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                {item.description}
              </p>
              <div className={`mt-6 text-sm font-bold flex items-center transition-colors ${item.brandColor.replace('bg-', 'text-')}`}>
                Shop on {item.brandName} <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}