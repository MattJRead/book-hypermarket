'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';

type Book = { id: string; title: string; author: string; category: string; cover_image_url?: string };
type UserAccount = { id: string; email: string; created_at: string; last_sign_in: string };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'book_info' | 'broadcast' | 'analytics' | 'accounts'>('analytics');
  const [adminSecret, setAdminSecret] = useState(''); 

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

  // --- ANALYTICS STATE ---
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [analyticsStatus, setAnalyticsStatus] = useState('Initializing tracker...');

  // 1. Load Books on Mount
  useEffect(() => {
    async function loadBooks() {
      const { data } = await supabase.from('books').select('id, title, author, category, cover_image_url').order('title');
      if (data) setBooks(data);
    }
    loadBooks();
  }, []);

  // 2. Load Analytics when tab is active
  useEffect(() => {
    async function fetchAnalytics() {
      if (activeTab === 'analytics') {
        setAnalyticsStatus('Syncing with database...');
        const { data, error } = await supabase
          .from('analytics')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          setAnalyticsStatus('Error: ' + error.message);
        } else {
          setAnalyticsData(data || []);
          setAnalyticsStatus('');
        }
      }
    }
    fetchAnalytics();
  }, [activeTab]);

  // Book Info Actions
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

  // Broadcast Actions (Currently Offline/Missing Backend)
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
        setBcStatus({ loading: false, message: data.error || '[API ROUTE MISSING]', isError: true });
      }
    } catch (err) {
      setBcStatus({ loading: false, message: 'Network failure. Backend API missing.', isError: true });
    }
  };

  // Load Accounts Action (Currently Offline/Missing Backend)
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
        setAccountsStatus(data.error || 'Failed to fetch. Backend API missing.');
      }
    } catch (err) {
      setAccountsStatus('Network error. Backend API missing.');
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  // Analytics Math
  const visits = analyticsData.filter(e => e.event_type === 'page_visit');
  const clicks = analyticsData.filter(e => e.event_type === 'affiliate_click');

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-5xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center">
            <svg className="w-8 h-8 mr-3 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Command Center
          </h1>
          <Link href="/" className="px-6 py-2 rounded-lg text-sm font-bold bg-gray-800 hover:bg-gray-700 transition-colors shadow-md">
            Return to Storefront
          </Link>
        </div>

        {/* 📑 INVISIBLE TABS NAVIGATION */}
        <div className="flex gap-8 border-b border-gray-800 mb-8">
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'book_info', label: 'Book Info' },
            { id: 'accounts', label: 'Accounts (Offline)' },
            { id: 'broadcast', label: 'Broadcast (Offline)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-bold tracking-wide transition-colors relative ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-sky-500"></span>}
            </button>
          ))}
        </div>

        {/* =========================================
            TAB: ANALYTICS (NEW!)
            ========================================= */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-300">
            {analyticsStatus ? (
              <div className="text-center py-12 text-sky-400 font-mono animate-pulse">[{analyticsStatus}]</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-sm">Total Page Visits</h3>
                    <p className="text-5xl font-black text-emerald-400">{visits.length}</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-sm">Affiliate Clicks</h3>
                    <p className="text-5xl font-black text-purple-400">{clicks.length}</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-sm">Conversion Ratio</h3>
                    <p className="text-5xl font-black text-yellow-400">
                      {visits.length > 0 ? Math.round((clicks.length / visits.length) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
                  <div className="p-4 bg-gray-800 border-b border-gray-700 font-bold text-gray-300">Live Click Feed</div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-900 text-gray-500 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Time</th>
                        <th className="px-6 py-3">Target Book</th>
                        <th className="px-6 py-3">Storefront</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 bg-gray-950">
                      {clicks.slice(0, 15).map((click) => (
                        <tr key={click.id} className="hover:bg-gray-900 transition-colors">
                          <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                            {new Date(click.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-sky-400">
                            {click.details?.book_title || 'Unknown Title'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs font-mono text-gray-300 capitalize">
                              {click.details?.shop || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {clicks.length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-600 font-mono">No tracking data recorded yet. Go click a book!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* =========================================
            TAB: BOOK INFO
            ========================================= */}
        {activeTab === 'book_info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 text-sky-400">Search Vault</h2>
              <input type="text" placeholder="Search by title or author..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500 mb-4" />
              
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">
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
            TAB: BROADCAST (OFFLINE STATE)
            ========================================= */}
        {activeTab === 'broadcast' && (
          <div className="w-full max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 relative overflow-hidden opacity-75">
            <h2 className="text-lg font-bold mb-2 text-gray-500">Broadcast System (Offline)</h2>
            <p className="text-sm text-gray-600 mb-6 font-mono">WARNING: Backend API route missing. Deploying messages will fail until `/api/admin/broadcast` is constructed.</p>
            <form onSubmit={handleBroadcast} className="flex flex-col gap-5 pointer-events-none grayscale">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                <input disabled type="text" placeholder="System Offline" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none" />
              </div>
              <button disabled type="button" className="mt-2 w-full py-4 rounded-lg font-bold text-sm bg-gray-800 text-gray-600 cursor-not-allowed">
                SYSTEM OFFLINE
              </button>
            </form>
          </div>
        )}

        {/* =========================================
            TAB: ACCOUNTS (OFFLINE STATE)
            ========================================= */}
        {activeTab === 'accounts' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 opacity-75">
            <h2 className="text-lg font-bold text-gray-500 mb-2">Platform Registry (Offline)</h2>
            <p className="text-sm text-gray-600 mb-6 font-mono">WARNING: Backend API route missing. Fetching accounts will fail until `/api/admin/users` is constructed.</p>
            
            <div className="overflow-x-auto pointer-events-none grayscale">
              <table className="w-full text-left text-sm">
                <thead className="bg-black text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Email</th>
                    <th className="px-4 py-3">Account Created</th>
                    <th className="px-4 py-3 rounded-tr-lg">Last Sign In</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-700 border-t border-gray-800 font-mono">SYSTEM OFFLINE</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}