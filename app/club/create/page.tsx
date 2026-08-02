'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Book = { 
  id: string; 
  title: string; 
  author: string; 
  isbn13: string; 
  category: string; 
  cover_image_url?: string; 
};

export default function CreateClubPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form States
  const [clubName, setClubName] = useState('');
  const [dateType, setDateType] = useState<'none' | 'start' | 'finish'>('none');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Live Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });
  }, []);

  // The Live Search Engine
  useEffect(() => {
    const searchBooks = async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/live-search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success && data.books) {
          setSearchResults(data.books.filter((b: Book) => b.isbn13).slice(0, 6));
        }
      } catch (e) {
        console.error("Live search failed");
      }
      setIsSearching(false);
    };

    const debounce = setTimeout(searchBooks, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('You must be signed in to forge a club.');
    if (!selectedBook) return alert('You must select a starting book first.');
    
    setIsSubmitting(true);

    const payload: any = {
      name: clubName,
      creator_id: user.id, 
      current_book_isbn: selectedBook.isbn13
    };

    if (dateType === 'start') payload.start_date = selectedDate;
    if (dateType === 'finish') payload.target_finish_date = selectedDate;

    // 1. Create the Club
    const { data: clubData, error: clubError } = await supabase
      .from('clubs')
      .insert(payload)
      .select()
      .single();

    if (clubError) {
      console.error("Vault Rejection:", clubError);
      alert('The database blocked the creation. Please check the console for column errors.');
      setIsSubmitting(false);
      return;
    }

    // 2. INSTANTLY add the Creator to the Roster
    await supabase.from('club_members').insert({
      club_id: clubData.id,
      user_id: user.id,
      role: 'owner',
      reading_format: 'Physical Book',
      progress_percentage: 0
    });

    router.push(`/club/${clubData.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center pt-20 px-6">
      
      <div className="w-full max-w-[600px]">
        <Link href="/club" className="text-sm text-blue-400 hover:text-blue-300 font-bold mb-6 inline-block transition-colors">
          ← Back to Hub
        </Link>
        
        <div className="bg-[#1e293b] rounded-xl border border-gray-700 shadow-2xl p-8 md:p-10 relative">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-sky-400 rounded-t-xl"></div>
          
          <h1 className="text-3xl font-black mb-2">Forge a New Club</h1>
          <p className="text-gray-400 text-sm mb-8">
            Create a private space for your reading network. You will receive an invite ID immediately after creation.
          </p>
          
          <form onSubmit={handleCreate} className="space-y-6">
            
            {/* 1. CLUB NAME */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Club Name</label>
              <input 
                type="text" 
                required 
                value={clubName} 
                onChange={(e) => setClubName(e.target.value)} 
                placeholder="e.g. The Ankh-Morpork City Watch" 
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
              />
            </div>

            {/* 2. THE SMART BOOK SEARCH */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Starting Book</label>
              
              {selectedBook ? (
                <div className="bg-[#0f172a] border border-emerald-500/50 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden">
                  <div className="w-24 md:w-32 h-auto relative rounded overflow-hidden shadow-lg border border-gray-700 mb-4">
                    <img 
                      src={(selectedBook.cover_image_url && selectedBook.cover_image_url !== 'UNAVAILABLE') ? selectedBook.cover_image_url.replace('http:', 'https:') : '/fox-placeholder.png'} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-xl text-white leading-tight mb-1 max-w-sm">{selectedBook.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{selectedBook.author}</p>
                  <p className="text-xs text-emerald-400 font-mono mb-6 bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-800/50">ISBN: {selectedBook.isbn13}</p>
                  
                  <button type="button" onClick={() => setSelectedBook(null)} className="text-gray-300 hover:text-white font-bold text-sm px-6 py-2 bg-gray-800 rounded-full transition-colors hover:bg-red-600 shadow-md">
                    Change Book
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Type a title, author, or ISBN..." 
                    className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                       <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  {/* Live Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute w-full mt-2 bg-[#1e293b] border border-gray-600 rounded-lg shadow-2xl overflow-hidden z-20">
                      {searchResults.map((book) => (
                        <div 
                          key={book.id} 
                          onClick={() => { setSelectedBook(book); setSearchResults([]); setSearchQuery(''); }} 
                          className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 transition-colors"
                        >
                          <div className="w-8 h-12 relative rounded overflow-hidden shrink-0">
                            <img 
                              src={(book.cover_image_url && book.cover_image_url !== 'UNAVAILABLE') ? book.cover_image_url.replace('http:', 'https:') : '/fox-placeholder.png'} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white truncate">{book.title}</p>
                            <p className="text-xs text-gray-400 truncate">{book.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. THE DYNAMIC DATE TOGGLE */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reading Timeline</label>
              
              <div className="flex bg-[#0f172a] rounded-lg border border-gray-600 p-1 mb-3">
                <button type="button" onClick={() => setDateType('none')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${dateType === 'none' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-300'}`}>Flexible</button>
                <button type="button" onClick={() => setDateType('start')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${dateType === 'start' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-300'}`}>Start Date</button>
                <button type="button" onClick={() => setDateType('finish')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${dateType === 'finish' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-300'}`}>Finish Date</button>
              </div>

              {dateType !== 'none' && (
                <input 
                  type="date" 
                  required 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition" 
                />
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !selectedBook} 
              className={`w-full font-bold py-3 px-6 rounded-lg transition-all ${isSubmitting || !selectedBook ? 'bg-blue-600/50 text-white/50 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}
            >
              {isSubmitting ? 'Forging Network...' : 'Launch Club'}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}