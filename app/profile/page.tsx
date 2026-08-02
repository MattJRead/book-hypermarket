'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import FloatingMenu from '../../components/FloatingMenu';

const PRESET_AVATARS = ['📚', '🧙‍♂️', '🐉', '☕', '🕯️', '🦉', '⚔️', '🌌'];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile States
  const [displayName, setDisplayName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('📚');
  const [favBooks, setFavBooks] = useState<any[]>([]);
  const [favAuthors, setFavAuthors] = useState<string[]>([]);

  // Search Engine States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'books' | 'authors'>('books');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setDisplayName(data.display_name || '');
      setPronouns(data.pronouns || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || '📚');
      setFavBooks(data.favorite_books || []);
      setFavAuthors(data.favorite_authors || []);
    }
    setIsLoading(false);
  };

  // Live Search Effect (Queries Google Books for both authors and titles)
  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      try {
        const q = searchMode === 'authors' ? `inauthor:${searchQuery}` : searchQuery;
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5`);
        const data = await res.json();
        if (data.items) {
          if (searchMode === 'books') {
            setSearchResults(data.items.map((i: any) => ({
              title: i.volumeInfo.title,
              author: i.volumeInfo.authors?.[0] || 'Unknown',
              id: i.id
            })));
          } else {
             // Extract unique authors
             const authors = data.items.map((i: any) => i.volumeInfo.authors?.[0]).filter(Boolean);
             setSearchResults(Array.from(new Set(authors)));
          }
        }
      } catch (e) {
        setSearchResults([]);
      }
    };
    const debounce = setTimeout(search, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchMode]);

  // Keyboard Navigation Support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0) {
        handleAddFavorite(searchResults[focusedIndex]);
      } else if (searchQuery.trim()) {
        // Fallback: Add exactly what they typed if they hit enter without navigating
        handleAddFavorite(searchMode === 'authors' ? searchQuery : { title: searchQuery, author: 'Custom Entry' });
      }
    }
  };

  const handleAddFavorite = (item: any) => {
    if (searchMode === 'books') {
      if (!favBooks.find(b => b.title === item.title)) setFavBooks([...favBooks, item]);
    } else {
      if (!favAuthors.includes(item)) setFavAuthors([...favAuthors, item]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setFocusedIndex(-1);
    searchInputRef.current?.focus();
  };

  const removeBook = (title: string) => setFavBooks(favBooks.filter(b => b.title !== title));
  const removeAuthor = (author: string) => setFavAuthors(favAuthors.filter(a => a !== author));

  const saveProfile = async () => {
    setIsSaving(true);
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: displayName,
      pronouns: pronouns,
      bio: bio,
      avatar_url: avatarUrl,
      favorite_books: favBooks,
      favorite_authors: favAuthors,
      updated_at: new Date().toISOString()
    });
    setIsSaving(false);
    alert("Profile Successfully secured in the vault.");
  };

  if (isLoading) return <div className="min-h-screen bg-[#0f172a] flex justify-center items-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <div className="min-h-screen bg-[#0f172a] text-white flex justify-center items-center"><Link href="/login" className="bg-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-500 transition">Please Login</Link></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto mt-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-gray-800/40 p-6 md:p-8 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-gray-900 border-2 border-blue-500 rounded-full flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
               {avatarUrl}
             </div>
             <div>
               <h1 className="text-3xl font-black mb-1">{displayName || 'Anonymous Reader'}</h1>
               <p className="text-gray-400 font-mono text-sm">{pronouns || 'Add Pronouns'}</p>
             </div>
          </div>
          <button onClick={saveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all">
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN: Basic Info & Avatar */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700/60 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">Identity</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pronouns</label>
                  <input type="text" placeholder="e.g. He/Him, She/Her, They/Them" value={pronouns} onChange={(e) => setPronouns(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reader Bio</label>
                  <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition resize-none" placeholder="A little about your reading habits..."></textarea>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700/60 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Choose Avatar</h2>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map(avatar => (
                  <button 
                    key={avatar} 
                    onClick={() => setAvatarUrl(avatar)}
                    className={`text-3xl p-3 rounded-xl transition-all ${avatarUrl === avatar ? 'bg-blue-600/30 border-2 border-blue-500 scale-110' : 'bg-gray-900 border-2 border-transparent hover:bg-gray-700'}`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Favorites Library */}
          <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700/60 backdrop-blur-sm flex flex-col h-full">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">Favorites Library</h2>
            
            {/* The Search Bar */}
            <div className="relative mb-8 z-20">
              <div className="flex bg-gray-900 rounded-xl p-1 mb-2 border border-gray-700">
                <button onClick={() => setSearchMode('books')} className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${searchMode === 'books' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Find Book</button>
                <button onClick={() => setSearchMode('authors')} className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${searchMode === 'authors' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Find Author</button>
              </div>
              
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery} 
                onChange={(e) => { setSearchQuery(e.target.value); setFocusedIndex(-1); }}
                onKeyDown={handleKeyDown}
                placeholder={`Search for a favorite ${searchMode === 'books' ? 'book' : 'author'}...`}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition" 
              />
              
              {/* Dropdown Menu */}
              {searchResults.length > 0 && (
                <div className="absolute w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden">
                  {searchResults.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleAddFavorite(item)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className={`p-3 border-b border-gray-700 cursor-pointer flex flex-col transition-colors ${focusedIndex === idx ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                    >
                      {searchMode === 'books' ? (
                        <>
                          <span className="font-bold text-white">{item.title}</span>
                          <span className={`text-xs ${focusedIndex === idx ? 'text-blue-200' : 'text-gray-400'}`}>{item.author}</span>
                        </>
                      ) : (
                        <span className="font-bold text-white">{item}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Side-by-Side Display */}
            <div className="flex flex-col md:flex-row gap-6 flex-1">
              
              <div className="flex-1 bg-gray-900/50 p-4 rounded-2xl border border-gray-700">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Books</h3>
                {favBooks.length === 0 ? <p className="text-xs text-gray-500 italic">No books added.</p> : (
                  <div className="space-y-2">
                    {favBooks.map((book, i) => (
                      <div key={i} className="group flex justify-between items-start bg-gray-800 p-2 rounded-lg border border-gray-700 hover:border-blue-500 transition">
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{book.title}</p>
                          <p className="text-[10px] text-gray-400">{book.author}</p>
                        </div>
                        <button onClick={() => removeBook(book.title)} className="text-gray-500 hover:text-red-500 px-1 opacity-0 group-hover:opacity-100 transition">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 bg-gray-900/50 p-4 rounded-2xl border border-gray-700">
                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">Authors</h3>
                {favAuthors.length === 0 ? <p className="text-xs text-gray-500 italic">No authors added.</p> : (
                  <div className="space-y-2">
                    {favAuthors.map((author, i) => (
                      <div key={i} className="group flex justify-between items-center bg-gray-800 p-2.5 rounded-lg border border-gray-700 hover:border-purple-500 transition">
                        <p className="text-sm font-bold text-white">{author}</p>
                        <button onClick={() => removeAuthor(author)} className="text-gray-500 hover:text-red-500 px-1 opacity-0 group-hover:opacity-100 transition">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
            </div>

          </div>
        </div>
      </div>
      
      <FloatingMenu />
    </div>
  );
}