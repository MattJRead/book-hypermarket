'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import FloatingMenu from '../../components/FloatingMenu';

const PRESET_AVATARS = [
  '📚','📖','📜','🖋️','🔮','🕯️','🗝️','🚪',
  '🧙‍♂️','🧙‍♀️','🧝‍♂️','🧝‍♀️','🧚','🧛','🧜‍♀️','🧞‍♂️',
  '🐉','🐲','🦖','🦄','🦅','🦉','🐺','🐍',
  '💀','🇬🇧','🎆','🎃','🪔','👤','🚀','🛸',
  '⚔️','🛡️','🏹','🏰','🌋','🌌','🌙','⭐',
  '☕','🍵','🍷','🍎','🌿','🔥','💧','💎',
  '🔴','🔵','🟢','⚫','⚪','❤️','💙','💚',
  '🎨','🎭','🎪','🎫','🎬','🎭','🎼','🎹',
  '🎸','🎺','🎻','🥁','🎷','🪕','🪗','🪘',
  '🐵','🐶','🐱','🐰','🦊','🐻','🐼','🐨'
];

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

  // 🔴 MAGIC FIX: Routed through internal API for guaranteed stability
  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/live-search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        
        if (data.success && data.books) {
          if (searchMode === 'books') {
            // Map and deduplicate books
            const mapped = data.books.map((b: any) => ({
              title: b.title,
              author: b.author || 'Unknown',
              id: b.id
            }));
            const uniqueBooks = Array.from(new Map(mapped.map((item: any) => [item.title, item])).values());
            setSearchResults(uniqueBooks.slice(0, 8));
          } else {
            // Extract unique authors
            const authors = data.books.map((b: any) => b.author).filter(Boolean);
            const uniqueAuthors = Array.from(new Set(authors));
            setSearchResults(uniqueAuthors.slice(0, 8));
          }
        }
      } catch (e) {
        console.error("Search failed:", e);
        setSearchResults([]);
      }
    };
    const debounce = setTimeout(search, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchMode]);

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
    const { error } = await supabase.from('profiles').upsert({
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

    if (error) {
      console.error("Profile Save Error:", error);
      alert(`Failed to save profile: ${error.message}`);
    } else {
      alert("Profile successfully updated."); 
    }
  };

  if (isLoading) return <main className="min-h-screen flex justify-center items-center bg-transparent"><div className="w-10 h-10 border-4 border-[#00bfff] border-t-transparent rounded-full animate-spin"></div></main>;
  if (!user) return <main className="min-h-screen flex justify-center items-center bg-transparent"><Link href="/login" className="bg-[#00bfff] text-white px-6 py-2 rounded-full font-bold hover:opacity-80 transition">Please Login</Link></main>;

  return (
    <main className="min-h-screen flex flex-col p-6 md:p-12 relative overflow-hidden bg-transparent">
      
      <div className="relative z-10 w-full max-w-4xl mx-auto mt-8">
        
        {/* HEADER */}
        <div className="theme-element flex flex-col md:flex-row justify-between items-center mb-10 gap-6 p-6 md:p-8 rounded-3xl border">
          <div className="flex items-center gap-6">
             <div className="w-20 h-20 theme-element border-2 rounded-full flex items-center justify-center text-4xl">
               {avatarUrl}
             </div>
             <div>
               <h1 className="text-3xl font-black mb-1">{displayName || 'Anonymous Reader'}</h1>
               <p className="font-mono text-sm opacity-70">{pronouns || 'Add Pronouns'}</p>
             </div>
          </div>
          <button onClick={saveProfile} disabled={isSaving} className="bg-[#00bfff] hover:bg-[#009acd] text-white font-bold py-3 px-8 rounded-xl transition-all">
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN: Basic Info & Avatar */}
          <div className="space-y-6">
            <div className="theme-element p-6 rounded-3xl border">
              <h2 className="text-xl font-bold mb-6 border-b pb-2 border-inherit">Identity</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-70">Display Name</label>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full theme-element border rounded-xl p-3 focus:border-[#00bfff] outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-70">Pronouns</label>
                  <input type="text" placeholder="e.g. He/Him, She/Her, They/Them" value={pronouns} onChange={(e) => setPronouns(e.target.value)} className="w-full theme-element border rounded-xl p-3 focus:border-[#00bfff] outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-70">Reader Bio</label>
                  <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full theme-element border rounded-xl p-3 focus:border-[#00bfff] outline-none transition resize-none" placeholder="A little about your reading habits..."></textarea>
                </div>
              </div>
            </div>

            <div className="theme-element p-6 rounded-3xl border">
              <h2 className="text-xl font-bold mb-4 border-b pb-2 border-inherit">Choose Avatar</h2>
              <div className="grid grid-cols-5 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-2 theme-element border rounded-2xl">
                {PRESET_AVATARS.map(avatar => (
                  <button 
                    key={avatar} 
                    onClick={() => setAvatarUrl(avatar)}
                    className={`text-2xl p-2 rounded-xl transition-all flex justify-center items-center ${avatarUrl === avatar ? 'bg-[#00bfff] text-white scale-110' : 'bg-transparent border-2 border-transparent hover:scale-105 opacity-80 hover:opacity-100'}`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Favorites Library */}
          <div className="theme-element p-6 rounded-3xl border flex flex-col h-full">
            <h2 className="text-xl font-bold mb-6 border-b pb-2 border-inherit">Favorites Library</h2>
            
            {/* The Search Bar */}
            <div className="relative mb-8 z-20">
              <div className="flex theme-element rounded-xl p-1 mb-2 border">
                <button onClick={() => setSearchMode('books')} className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${searchMode === 'books' ? 'bg-[#00bfff] text-white' : 'hover:opacity-70'}`}>Find Book</button>
                <button onClick={() => setSearchMode('authors')} className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${searchMode === 'authors' ? 'bg-[#00bfff] text-white' : 'hover:opacity-70'}`}>Find Author</button>
              </div>
              
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery} 
                onChange={(e) => { setSearchQuery(e.target.value); setFocusedIndex(-1); }}
                onKeyDown={handleKeyDown}
                placeholder={`Search for a favorite ${searchMode === 'books' ? 'book' : 'author'}...`}
                className="w-full theme-element border rounded-xl p-4 focus:border-[#00bfff] outline-none transition" 
              />
              
              {/* Dropdown Menu */}
              {searchResults.length > 0 && (
                <div className="absolute w-full mt-2 theme-element border rounded-xl overflow-hidden z-50">
                  {searchResults.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleAddFavorite(item)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className={`p-3 border-b border-inherit cursor-pointer flex flex-col transition-colors ${focusedIndex === idx ? 'bg-[#00bfff] text-white' : 'hover:opacity-70'}`}
                    >
                      {searchMode === 'books' ? (
                        <>
                          <span className="font-bold">{item.title}</span>
                          <span className={`text-xs ${focusedIndex === idx ? 'text-white/80' : 'opacity-60'}`}>{item.author}</span>
                        </>
                      ) : (
                        <span className="font-bold">{item}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Side-by-Side Display */}
            <div className="flex flex-col md:flex-row gap-6 flex-1">
              
              <div className="flex-1 theme-element p-4 rounded-2xl border">
                <h3 className="text-sm font-bold text-[#00bfff] uppercase tracking-widest mb-4">Books</h3>
                {favBooks.length === 0 ? <p className="text-xs italic opacity-50">No books added.</p> : (
                  <div className="space-y-2">
                    {favBooks.map((book, i) => (
                      <div key={i} className="group flex justify-between items-start theme-element p-2 rounded-lg border hover:border-[#00bfff] transition">
                        <div>
                          <p className="text-sm font-bold leading-tight">{book.title}</p>
                          <p className="text-[10px] opacity-70">{book.author}</p>
                        </div>
                        <button onClick={() => removeBook(book.title)} className="text-red-500 hover:text-red-400 px-1 opacity-0 group-hover:opacity-100 transition">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 theme-element p-4 rounded-2xl border">
                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">Authors</h3>
                {favAuthors.length === 0 ? <p className="text-xs italic opacity-50">No authors added.</p> : (
                  <div className="space-y-2">
                    {favAuthors.map((author, i) => (
                      <div key={i} className="group flex justify-between items-center theme-element p-2.5 rounded-lg border hover:border-purple-500 transition">
                        <p className="text-sm font-bold">{author}</p>
                        <button onClick={() => removeAuthor(author)} className="text-red-500 hover:text-red-400 px-1 opacity-0 group-hover:opacity-100 transition">✕</button>
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
    </main>
  );
}