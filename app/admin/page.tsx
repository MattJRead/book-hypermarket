'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import CategoryManager from '../../components/CategoryManager'; 
// (Adjust the '../' based on exactly how deep your admin page is)

type Book = { id: string; title: string; author: string; category: string; cover_image_url?: string };
type UserAccount = { id: string; email: string; created_at: string; last_sign_in: string };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'book_info' | 'broadcast' | 'prices' | 'accounts'>('book_info');
  const [adminSecret, setAdminSecret] = useState(''); // Global state, but safely rendered at the bottom of forms

  // --- BOOK INFO STATE ---
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [bookStatus, setBookStatus] = useState('');

  // --- BROADCAST STATE ---
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcType, setBcType] = useState('system_update');
  const [bcActionUrl, setBcActionUrl] = useState('');
  const [bcStatus, setBcStatus] = useState({ loading: false, message: '', isError: false });

  // --- ACCOUNTS STATE ---
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [accountsStatus, setAccountsStatus] = useState('');

  // 1. Load Books on Mount
  useEffect(() => {
    async function loadBooks() {
      const { data } = await supabase.from('books').select('id, title, author, category, cover_image_url').order('title');
      if (data) setBooks(data);
    }
    loadBooks();
  }, []);

  // 2. Book Info Actions
  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setEditCategory(book.category || 'General');
    setEditCoverUrl(book.cover_image_url || '');
    setBookStatus('');
  };

  const handleUpdateBook = async () => {
    if (!selectedBook) return;
    setBookStatus('Saving...');
    const { error } = await supabase
      .from('books')
      .update({ category: editCategory, cover_image_url: editCoverUrl })
      .eq('id', selectedBook.id);
      
    if (error) {
      setBookStatus('Error saving update.');
    } else {
      setBookStatus('Book updated successfully!');
      setBooks(books.map(b => b.id === selectedBook.id ? { ...b, category: editCategory, cover_image_url: editCoverUrl } : b));
    }
  };

  // 3. Broadcast Actions
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBcStatus({ loading: true, message: 'Deploying...', isError: false });
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bcTitle, message: bcMessage, type: bcType, action_url: bcActionUrl, secret: adminSecret })
      });
      const data = await res.json();
      if (res.ok) {
        setBcStatus({ loading: false, message: data.message, isError: false });
        setBcTitle(''); setBcMessage(''); setBcActionUrl('');
      } else {
        setBcStatus({ loading: false, message: data.error, isError: true });
      }
    } catch (err) {
      setBcStatus({ loading: false, message: 'Network failure.', isError: true });
    }
  };

  // 4. Load Accounts Action
  const fetchAccounts = async () => {
    setAccountsStatus('Fetching registry...');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: adminSecret })
      });
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.users);
        setAccountsStatus(`Loaded ${data.users.length} accounts.`);
      } else {
        setAccountsStatus(data.error || 'Failed to fetch.');
      }
    } catch (err) {
      setAccountsStatus('Network error.');
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-5xl">
        
        {/* Header (Password field safely removed from here) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center">
            <svg className="w-8 h-8 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Command Center
          </h1>
          <Link href="/" className="px-6 py-2 rounded-lg text-sm font-bold bg-gray-800 hover:bg-gray-700 transition-colors shadow-md">
            Return to Storefront
          </Link>
        </div>

        {/* 📑 INVISIBLE TABS NAVIGATION */}
        <div className="flex gap-8 border-b border-gray-800 mb-8">
          {[
            { id: 'book_info', label: 'Book Info' },
            { id: 'broadcast', label: 'Broadcast' },
            { id: 'accounts', label: 'Accounts' },
            { id: 'prices', label: 'Prices' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-bold tracking-wide transition-colors relative ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500"></span>}
            </button>
          ))}
        </div>

        {/* =========================================
            TAB 1: BOOK INFO & COVER ART UPDATER
            ========================================= */}
        {activeTab === 'book_info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 text-sky-400">Search Vault</h2>
              <input type="text" placeholder="Search by title or author..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500 mb-4" />
              
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {searchQuery && filteredBooks.map(book => (
                  <button key={book.id} onClick={() => handleSelectBook(book)} className={`text-left p-3 rounded-lg border transition-colors ${selectedBook?.id === book.id ? 'bg-sky-900/30 border-sky-500' : 'bg-gray-950 border-gray-800 hover:border-gray-600'}`}>
                    <div className="font-bold text-sm truncate">{book.title}</div>
                    <div className="text-xs text-gray-500 truncate">{book.author}</div>
                  </button>
                ))}
                {searchQuery && filteredBooks.length === 0 && <p className="text-gray-500 text-sm">No books found.</p>}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
              <h2 className="text-lg font-bold mb-4 text-sky-400">Edit Metadata</h2>
              {!selectedBook ? (
                <div className="text-gray-500 text-sm italic">Select a book from the vault to edit its information.</div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-4 items-center p-3 bg-black rounded-lg border border-gray-800">
                    <div className="w-12 h-16 shrink-0 bg-gray-800 rounded border border-gray-700 overflow-hidden relative">
                      {editCoverUrl ? <Image src={editCoverUrl} alt="Cover" fill className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-500">COVER</span>}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{selectedBook.title}</h3>
                      <p className="text-xs text-gray-500">{selectedBook.author}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500">
                      <option value="General">General</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Horror">Horror</option>
                      <option value="Learning / Educational">Learning / Educational</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cover Image URL</label>
                    <input type="text" value={editCoverUrl} onChange={(e) => setEditCoverUrl(e.target.value)} placeholder="Paste direct image link here (https://...)" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500" />
                  </div>

                  <button onClick={handleUpdateBook} className="mt-2 w-full py-3 rounded-lg font-bold text-sm bg-sky-600 hover:bg-sky-500 transition-colors">
                    Save Changes
                  </button>
                  {bookStatus && <div className="text-center text-xs font-mono text-emerald-400 mt-2">{bookStatus}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: BROADCAST SYSTEM
            ========================================= */}
        {activeTab === 'broadcast' && (
          <div className="w-full max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
            <h2 className="text-lg font-bold mb-6 text-red-500">Deploy Global Notification</h2>
            <form onSubmit={handleBroadcast} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notification Type</label>
                <select value={bcType} onChange={(e) => setBcType(e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500">
                  <option value="system_update">System Update</option>
                  <option value="new_release">New Feature Release</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</label>
                <input required type="text" value={bcTitle} onChange={(e) => setBcTitle(e.target.value)} placeholder="e.g. Price Radar is Live!" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</label>
                <textarea required rows={4} value={bcMessage} onChange={(e) => setBcMessage(e.target.value)} placeholder="Type your broadcast..." className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Action URL (Optional)</label>
                <input type="text" value={bcActionUrl} onChange={(e) => setBcActionUrl(e.target.value)} placeholder="e.g. /wishlist" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500" />
              </div>

              {/* DEDICATED PASSWORD FIELD */}
              <div className="pt-4 border-t border-gray-800 mt-2">
                <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Authorization Code
                </label>
                <input required type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="Enter Admin Secret..." className="w-full bg-black border border-red-900 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 text-red-500" />
              </div>

              <button disabled={bcStatus.loading || !adminSecret} type="submit" className={`mt-2 w-full py-4 rounded-lg font-bold text-sm transition-all flex justify-center items-center ${bcStatus.loading || !adminSecret ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'}`}>
                {!adminSecret ? 'REQUIRES ADMIN SECRET' : bcStatus.loading ? '[ DEPLOYING... ]' : 'DEPLOY BROADCAST'}
              </button>
              
              {bcStatus.message && (
                <div className={`p-4 rounded-lg text-sm font-mono border ${bcStatus.isError ? 'bg-red-950/50 border-red-900 text-red-400' : 'bg-emerald-950/50 border-emerald-900 text-emerald-400'}`}>
                  {bcStatus.message}
                </div>
              )}
            </form>
          </div>
        )}

        {/* =========================================
            TAB 3: USER ACCOUNTS
            ========================================= */}
        {activeTab === 'accounts' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-lg font-bold text-sky-400">Platform Registry</h2>
              
              {/* DEDICATED PASSWORD FIELD */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="Admin Secret..." className="bg-black border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sky-500 text-gray-300 w-full sm:w-auto" />
                <button onClick={fetchAccounts} disabled={!adminSecret} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto whitespace-nowrap ${!adminSecret ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white'}`}>
                  Sync Registry
                </button>
              </div>
            </div>
            
            {accountsStatus && <div className="text-sm font-mono text-gray-400 mb-4">{accountsStatus}</div>}
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Email</th>
                    <th className="px-4 py-3">Account Created</th>
                    <th className="px-4 py-3 rounded-tr-lg">Last Sign In</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-600 border-t border-gray-800">No accounts loaded. Enter Admin Secret and sync.</td></tr>
                  ) : (
                    accounts.map(acc => (
                      <tr key={acc.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-mono text-gray-300">{acc.email}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(acc.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-500">{acc.last_sign_in ? new Date(acc.last_sign_in).toLocaleDateString() : 'Never'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: PRICES (COMING SOON)
            ========================================= */}
        {activeTab === 'prices' && (
          <div className="bg-gray-900 border-2 border-dashed border-gray-800 rounded-2xl p-16 text-center">
            <h2 className="text-2xl font-bold text-gray-600 mb-2">Price Control Matrix</h2>
            <p className="text-gray-500 text-sm">This module is currently offline. Reserved for future architectural expansion.</p>
          </div>
        )}

      </div>
    </main>
  );
}