'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateClubPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form States
  const [clubName, setClubName] = useState('');
  const [dateType, setDateType] = useState<'start' | 'finish' | 'none'>('none');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Live Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<{title: string, isbn: string, cover: string} | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });
  }, []);

  // The Live Google Books Search Engine
  useEffect(() => {
    const searchBooks = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5`);
        const data = await res.json();
        if (data.items) {
          setSearchResults(data.items);
        }
      } catch (e) {
        console.error("Search failed");
      }
      setIsSearching(false);
    };

    const debounce = setTimeout(searchBooks, 600);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const extractIsbn = (volumeInfo: any) => {
    const identifiers = volumeInfo.industryIdentifiers;
    if (!identifiers) return null;
    const isbn13 = identifiers.find((i: any) => i.type === 'ISBN_13');
    return isbn13 ? isbn13.identifier : identifiers[0].identifier; // Fallback to whatever ID they have
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('You must be signed in to forge a club.');
    if (!selectedBook) return alert('You must select a book first.');
    
    setIsSubmitting(true);

    const payload: any = {
      name: clubName,
      owner_id: user.id, // Adjust this column name to match your DB schema (e.g. created_by, user_id, admin_id)
      current_book_isbn: selectedBook.isbn
    };

    if (dateType === 'start') payload.start_date = selectedDate;
    if (dateType === 'finish') payload.target_finish_date = selectedDate;

    const { data, error } = await supabase
      .from('clubs')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert('The vault rejected the creation.');
      setIsSubmitting(false);
    } else {
      router.push(`/club/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/club" className="text-sm text-blue-400 hover:text-blue-300 font-bold mb-8 inline-block transition-colors">
          ← Back to Hub
        </Link>
        
        <h1 className="text-4xl font-black mb-8">Forge a New Network</h1>
        
        <form onSubmit={handleCreate} className="space-y-8 bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl backdrop-blur-sm">
          
          {/* 1. CLUB NAME */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Network Name</label>
            <input type="text" required value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="e.g. The Sci-Fi Syndicate" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition text-lg font-bold" />
          </div>

          {/* 2. THE SMART BOOK SEARCH */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select the First Book</label>
            
            {selectedBook ? (
              <div className="bg-gray-900 border border-green-500 rounded-lg p-4 flex items-center justify-between shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <div className="flex items-center gap-4">
                  <img src={selectedBook.cover || '/fox-placeholder.png'} alt="Cover" className="w-12 h-16 object-cover rounded shadow" />
                  <div>
                    <h3 className="font-bold text-lg text-white leading-tight">{selectedBook.title}</h3>
                    <p className="text-xs text-green-400 font-mono mt-1">ISBN: {selectedBook.isbn}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedBook(null)} className="text-gray-400 hover:text-red-400 font-bold text-sm px-3 py-1 bg-gray-800 rounded transition-colors">Change</button>
              </div>
            ) : (
              <div>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Type a title, author, or ISBN..." className="w-full bg-gray-900 border border-gray-600 rounded-lg p-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition" />
                {isSearching && <p className="text-sky-400 text-xs font-mono mt-2 animate-pulse">Scanning global archives...</p>}
                
                {/* Live Search Results Dropdown */}
                {searchResults.length > 0 && !selectedBook && (
                  <div className="absolute w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl overflow-hidden z-20 max-h-80 overflow-y-auto">
                    {searchResults.map((book: any, i: number) => {
                      const isbn = extractIsbn(book.volumeInfo);
                      const cover = book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:');
                      if (!isbn) return null;
                      
                      return (
                        <div key={i} onClick={() => { setSelectedBook({ title: book.volumeInfo.title, isbn: isbn, cover: cover || '' }); setSearchResults([]); setSearchQuery(''); }} className="flex items-center gap-4 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 transition-colors">
                          <img src={cover || '/fox-placeholder.png'} className="w-10 h-14 object-cover rounded shadow-sm" />
                          <div>
                            <p className="font-bold text-white line-clamp-1">{book.volumeInfo.title}</p>
                            <p className="text-xs text-gray-400">{book.volumeInfo.authors?.join(', ')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. THE DYNAMIC DATE TOGGLE */}
          <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Reading Timeline (Optional)</label>
            
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="dateType" checked={dateType === 'none'} onChange={() => setDateType('none')} className="text-blue-500" />
                <span className="text-sm font-bold">Flexible (No Date)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="dateType" checked={dateType === 'start'} onChange={() => setDateType('start')} className="text-blue-500" />
                <span className="text-sm font-bold">Set Start Date</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="dateType" checked={dateType === 'finish'} onChange={() => setDateType('finish')} className="text-blue-500" />
                <span className="text-sm font-bold">Set Target Finish</span>
              </label>
            </div>

            {dateType !== 'none' && (
              <input type="date" required value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
            )}
          </div>

          <button type="submit" disabled={isSubmitting || !selectedBook} className={`w-full font-black py-4 px-6 rounded-lg text-lg transition-all shadow-xl ${isSubmitting || !selectedBook ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02]'}`}>
            {isSubmitting ? 'Forging Network...' : 'Launch Club'}
          </button>
          
        </form>
      </div>
    </div>
  );
}