'use client';
import FloatingMenu from '../../components/FloatingMenu';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

type Book = {
  id: string;
  title: string;
  author: string;
  isbn13: string;
  category: string;
};

export default function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: State to hold dynamically added categories
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // We combine your core categories with any new ones you forge
  const coreCategories = ['Fiction', 'Non-Fiction', 'Horror', 'Learning / Educational', 'General'];
  const allCategories = Array.from(new Set([...coreCategories, ...customCategories]));

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    setIsLoading(true);
    const { data } = await supabase.from('books').select('*').order('title', { ascending: true });
    
    if (data) {
      setBooks(data);
      
      // Smart Scan: Check the database to see if you previously added custom categories to books
      // This ensures your custom categories don't disappear when you refresh the page
      const existingCategories = data.map(b => b.category).filter(Boolean);
      const uniqueExisting = Array.from(new Set(existingCategories));
      setCustomCategories(uniqueExisting.filter(c => !coreCategories.includes(c)));
    }
    setIsLoading(false);
  }

  async function handleCategoryChange(bookId: string, newCategory: string) {
    setBooks(books.map(b => b.id === bookId ? { ...b, category: newCategory } : b));
    await supabase.from('books').update({ category: newCategory }).eq('id', bookId);
  }

  // NEW: The function to forge a new category
  function forgeCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    
    // Add it to the list of available options
    setCustomCategories([...customCategories, newCategoryInput.trim()]);
    setNewCategoryInput(''); // Clear the input box
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <header className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-sky-400">Hypermarket Command Center</h1>
        <Link href="/" className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 font-bold transition-colors">
          Return to Storefront
        </Link>
      </header>

      <div className="max-w-6xl mx-auto mb-8 bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">The Category Forge</h2>
          <p className="text-sm text-gray-400">Create new shelves for your storefront.</p>
        </div>
        
        <form onSubmit={forgeCategory} className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            placeholder="e.g. Manga, Romance..." 
            className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 w-full md:w-64"
          />
          <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2 rounded-lg transition-colors whitespace-nowrap">
            + Add
          </button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-12 text-center text-sky-400 font-mono animate-pulse">Accessing Vault Data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="p-4 font-bold text-gray-300">Book Title</th>
                  <th className="p-4 font-bold text-gray-300">Author</th>
                  <th className="p-4 font-bold text-gray-300">ISBN-13</th>
                  <th className="p-4 font-bold text-gray-300">Assigned Shelf</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 font-medium">{book.title}</td>
                    <td className="p-4 text-gray-400 text-sm">{book.author}</td>
                    <td className="p-4 text-gray-500 font-mono text-sm">{book.isbn13}</td>
                    <td className="p-4">
                      <select 
                        value={book.category || 'General'} 
                        onChange={(e) => handleCategoryChange(book.id, e.target.value)}
                        className="bg-gray-950 border border-gray-700 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5 cursor-pointer"
                      >
                        {allCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <FloatingMenu />
    </main>
  );
}