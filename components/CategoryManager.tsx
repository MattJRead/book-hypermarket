'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust this path if your supabase client is elsewhere
import Image from 'next/image';

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  cover_image_url?: string;
};

export default function CategoryManager() {
  const [targetCategory, setTargetCategory] = useState<string>('Bestsellers');
  const [booksInCategory, setBooksInCategory] = useState<Book[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch books currently residing in the target category
  const fetchCategoryBooks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('id, title, author, category, cover_image_url')
      .eq('category', targetCategory)
      .order('title', { ascending: true });

    if (data) setBooksInCategory(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (targetCategory) fetchCategoryBooks();
  }, [targetCategory]);

  // 2. Search the entire vault for books to add
  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, category, cover_image_url')
        .ilike('title', `%${searchQuery}%`)
        .neq('category', targetCategory) // Don't show books already in this category
        .limit(10);

      if (data) setSearchResults(data);
      setIsSearching(false);
    }
  };

  // 3. The Transfer Engine: Move a book into the target category
  const moveBookToCategory = async (bookId: string, newCategory: string) => {
    // Optimistic UI update for immediate feedback
    setSearchResults(prev => prev.filter(b => b.id !== bookId));
    
    const { data: updatedBook, error } = await supabase
      .from('books')
      .update({ category: newCategory })
      .eq('id', bookId)
      .select()
      .single();

    if (updatedBook) {
      setBooksInCategory(prev => [...prev, updatedBook]);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl border border-gray-800 w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-extrabold mb-6 text-sky-400">Category Curation Engine</h2>
      
      {/* 🎯 TARGET CATEGORY SELECTOR */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <label className="block text-sm font-bold text-gray-400 mb-2">Target Category (Type to create a new one)</label>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={targetCategory}
            onChange={(e) => setTargetCategory(e.target.value)}
            className="flex-grow p-3 rounded-lg bg-gray-950 border border-gray-600 focus:border-sky-500 focus:outline-none text-lg font-bold"
            placeholder="e.g., Hypermarket Favorites"
          />
          <button 
            onClick={fetchCategoryBooks}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-lg font-bold transition-colors"
          >
            Load Shelf
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 📚 LEFT COLUMN: BOOKS CURRENTLY IN CATEGORY */}
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-950">
          <h3 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2 flex justify-between">
            <span>Books in: <span className="text-sky-400">{targetCategory}</span></span>
            <span className="text-gray-500 text-sm">{booksInCategory.length} items</span>
          </h3>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {isLoading ? (
              <p className="text-gray-500 animate-pulse">Scanning vault...</p>
            ) : booksInCategory.length === 0 ? (
              <p className="text-gray-500 italic">This category is currently empty.</p>
            ) : (
              booksInCategory.map(book => (
                <div key={book.id} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700 hover:border-gray-500 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {book.cover_image_url && book.cover_image_url !== 'UNAVAILABLE' ? (
                      <Image src={book.cover_image_url.replace('http:', 'https:')} alt="Cover" width={40} height={60} className="rounded object-cover" />
                    ) : (
                      <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center text-[10px] text-gray-400">No Cover</div>
                    )}
                    <div className="truncate">
                      <p className="font-bold text-sm truncate">{book.title}</p>
                      <p className="text-xs text-gray-400 truncate">{book.author}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => moveBookToCategory(book.id, 'General')}
                    className="ml-2 px-3 py-1 bg-red-900/50 hover:bg-red-800 text-red-300 text-xs font-bold rounded"
                    title="Evict from this category"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🔍 RIGHT COLUMN: SEARCH & INJECT */}
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-950">
          <h3 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">
            Add to Category
          </h3>
          
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search vault to add... (Press Enter)"
            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:border-sky-500 focus:outline-none mb-4"
          />

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            {isSearching ? (
              <p className="text-gray-500 animate-pulse">Searching global inventory...</p>
            ) : searchResults.length === 0 && searchQuery ? (
              <p className="text-gray-500 italic">Press Enter to search, or no results found.</p>
            ) : (
              searchResults.map(book => (
                <div key={book.id} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700 hover:border-gray-500 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {book.cover_image_url && book.cover_image_url !== 'UNAVAILABLE' ? (
                      <Image src={book.cover_image_url.replace('http:', 'https:')} alt="Cover" width={40} height={60} className="rounded object-cover" />
                    ) : (
                      <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center text-[10px] text-gray-400">No Cover</div>
                    )}
                    <div className="truncate">
                      <p className="font-bold text-sm truncate">{book.title}</p>
                      <p className="text-xs text-gray-400 truncate">Current: {book.category}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => moveBookToCategory(book.id, targetCategory)}
                    className="ml-2 px-3 py-1 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 text-xs font-bold rounded shrink-0"
                  >
                    + Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}