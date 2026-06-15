'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';

type Book = { id: string; title: string; author: string; category: string; cover_image_url?: string; isbn13: string };
type UserAccount = { id: string; email: string; created_at: string; last_sign_in: string };
type Banner = { id: string; title: string; subtitle: string; background_image_url: string; text_color: string; landing_page_text: string; target_isbns: string[]; is_published: boolean; };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'book_info' | 'banner_forge' | 'broadcast' | 'accounts'>('analytics');
  const [adminSecret, setAdminSecret] = useState(''); 

  // --- BOOK INFO STATE ---
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [bookStatus, setBookStatus] = useState('');

  // --- BANNER FORGE STATE ---
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [bannerStatus, setBannerStatus] = useState('');
  
  // New Global Search States for Banner Forge
  const [bannerSearchQuery, setBannerSearchQuery] = useState('');
  const [bannerApiResults, setBannerApiResults] = useState<Book[]>([]);
  const [isBannerSearching, setIsBannerSearching] = useState(false);
  const [hasPressedBannerEnter, setHasPressedBannerEnter] = useState(false);

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

  // 1. Load Data on Mount
  useEffect(() => {
    async function loadVaultData() {
      const { data: bookData } = await supabase.from('books').select('id, title, author, category, cover_image_url, isbn13').order('title');
      if (bookData) setBooks(bookData);

      const { data: bannerData } = await supabase.from('storefront_banners').select('*').order('created_at', { ascending: false });
      if (bannerData) setBanners(bannerData);
    }
    loadVaultData();
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

  // --- Actions: Books ---
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

  // --- Actions: Banners ---
  const handleSaveBanner = async () => {
    if (!editingBanner?.title) return setBannerStatus('Title is required.');
    setBannerStatus('Forging banner...');
    
    const bannerPayload = {
      title: editingBanner.title,
      subtitle: editingBanner.subtitle || '',
      background_image_url: editingBanner.background_image_url || '',
      text_color: editingBanner.text_color || 'text-white',
      landing_page_text: editingBanner.landing_page_text || '',
      target_isbns: editingBanner.target_isbns || [],
      is_published: editingBanner.is_published || false
    };

    if (editingBanner.id) {
      const { data, error } = await supabase.from('storefront_banners').update(bannerPayload).eq('id', editingBanner.id).select().single();
      if (error) setBannerStatus('Error updating banner.');
      else { setBanners(banners.map(b => b.id === data.id ? data : b)); setBannerStatus('Banner updated!'); }
    } else {
      const { data, error } = await supabase.from('storefront_banners').insert([bannerPayload]).select().single();
      if (error) setBannerStatus('Error creating banner.');
      else { setBanners([data, ...banners]); setEditingBanner(data); setBannerStatus('Banner forged!'); }
    }
  };

  const executeBannerSearch = async () => {
    if (!bannerSearchQuery.trim()) return;
    setIsBannerSearching(true);
    setHasPressedBannerEnter(true);
    try {
      const res = await fetch(`/api/live-search?q=${encodeURIComponent(bannerSearchQuery)}`);
      const data = await res.json();
      if (data.success && data.books) {
        setBannerApiResults(data.books);
      } else {
        setBannerApiResults([]);
      }
    } catch (error) {
      console.error("Global search failed", error);
    }
    setIsBannerSearching(false);
  };

  const addBannerBook = async (book: Book) => {
    if (!editingBanner || !book.isbn13) return; // Guard against missing ISBNs
    const isbn = book.isbn13;
    const currentIsbns = editingBanner.target_isbns || [];
    
    if (currentIsbns.includes(isbn)) return; // Prevent duplicates

    // If the book doesn't exist in our local Supabase state yet, provision it immediately
    if (!books.some(b => b.isbn13 === isbn)) {
      setBannerStatus(`Downloading ${book.title} to vault...`);
      try {
        const res = await fetch('/api/save-book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(book)
        });
        const savedBook = await res.json();
        if (savedBook.id) {
          setBooks(prev => [...prev, savedBook]);
        }
      } catch (e) {
        console.error("Failed to provision book:", e);
      }
      setBannerStatus('');
    }

    setEditingBanner({ ...editingBanner, target_isbns: [...currentIsbns, isbn] });
  };

  const removeBannerIsbn = (isbn: string) => {
    if (!editingBanner) return;
    setEditingBanner({ 
      ...editingBanner, 
      target_isbns: (editingBanner.target_isbns || []).filter(i => i !== isbn) 
    });
  };

  const deleteBanner = async (id: string) => {
    if(!confirm('Destroy this banner permanently?')) return;
    await supabase.from('storefront_banners').delete().eq('id', id);
    setBanners(banners.filter(b => b.id !== id));
    if (editingBanner?.id === id) setEditingBanner(null);
  };

  // --- Actions: Broadcast ---
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

  // --- Actions: Accounts ---
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

  // --- Search Filters ---
  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  
  // Banner display logic: Show API results if they pressed Enter, otherwise show local Supabase filter
  const displayBannerBooks = hasPressedBannerEnter 
    ? bannerApiResults 
    : books.filter(b => b.title.toLowerCase().includes(bannerSearchQuery.toLowerCase()) || b.author.toLowerCase().includes(bannerSearchQuery.toLowerCase())).slice(0, 10);

  const visits = analyticsData.filter(e => e.event_type === 'page_visit');
  const clicks = analyticsData.filter(e => e.event_type === 'affiliate_click');

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center">
            <svg className="w-8 h-8 mr-3 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Command Center
          </h1>
          <Link href="/" className="px-6 py-2 rounded-lg text-sm font-bold bg-gray-800 hover:bg-gray-700 transition-colors shadow-md">
            Return to Storefront
          </Link>
        </div>

        {/* 📑 TABS NAVIGATION */}
        <div className="flex gap-8 border-b border-gray-800 mb-8 overflow-x-auto pb-1">
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'banner_forge', label: 'Banner Forge' },
            { id: 'book_info', label: 'Book Info' },
            { id: 'accounts', label: 'Accounts' },
            { id: 'broadcast', label: 'Broadcast' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-bold tracking-wide transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-sky-500"></span>}
            </button>
          ))}
        </div>

        {/* =========================================
            TAB: ANALYTICS
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
            TAB: BANNER FORGE
            ========================================= */}
        {activeTab === 'banner_forge' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* LEFT: Banner List */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-1">
              <button onClick={() => { setEditingBanner({ title: '', subtitle: '', text_color: 'text-white', target_isbns: [], is_published: false }); setBannerStatus(''); }} className="w-full mb-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-lg font-bold text-sm transition-colors shadow-lg">
                + Forge New Banner
              </button>
              <h2 className="text-sm font-bold mb-4 text-gray-500 uppercase tracking-wider">Existing Banners</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {banners.map(banner => (
                  <div key={banner.id} className={`p-4 rounded-xl border cursor-pointer transition-colors ${editingBanner?.id === banner.id ? 'bg-sky-900/20 border-sky-500' : 'bg-gray-950 border-gray-800 hover:border-gray-600'}`} onClick={() => setEditingBanner(banner)}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold truncate pr-2">{banner.title}</h3>
                      <span className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${banner.is_published ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-600'}`}></span>
                    </div>
                    <p className="text-xs text-gray-500">{banner.target_isbns?.length || 0} books attached</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Banner Editor */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-2 relative overflow-hidden">
              {!editingBanner ? (
                <div className="flex items-center justify-center h-full text-gray-500 italic">Select a banner to edit, or forge a new one.</div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-bold text-sky-400">{editingBanner.id ? 'Edit Banner' : 'Forge New Banner'}</h2>
                    {editingBanner.id && <button onClick={() => deleteBanner(editingBanner.id!)} className="text-xs font-bold text-red-500 hover:text-red-400">Destroy Banner</button>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Title</label>
                      <input type="text" value={editingBanner.title || ''} onChange={e => setEditingBanner({...editingBanner, title: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-sky-500 focus:outline-none" placeholder="e.g. Summer Blockbusters" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Subtitle</label>
                      <input type="text" value={editingBanner.subtitle || ''} onChange={e => setEditingBanner({...editingBanner, subtitle: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-sky-500 focus:outline-none" placeholder="e.g. Your next great escape awaits." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Background Image URL</label>
                      <input type="text" value={editingBanner.background_image_url || ''} onChange={e => setEditingBanner({...editingBanner, background_image_url: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-sky-500 focus:outline-none" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Text Color</label>
                      <select value={editingBanner.text_color || 'text-white'} onChange={e => setEditingBanner({...editingBanner, text_color: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-sky-500 focus:outline-none">
                        <option value="text-white">White</option>
                        <option value="text-gray-900">Black / Dark</option>
                        <option value="text-sky-300">Sky Blue</option>
                        <option value="text-emerald-300">Emerald Green</option>
                        <option value="text-purple-300">Royal Purple</option>
                        <option value="text-yellow-300">Gold</option>
                        <option value="text-red-300">Crimson</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Landing Page Intro Text</label>
                    <textarea rows={3} value={editingBanner.landing_page_text || ''} onChange={e => setEditingBanner({...editingBanner, landing_page_text: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-sky-500 focus:outline-none resize-none" placeholder="The text users see at the top of the page after clicking this banner..." />
                  </div>

                  {/* Target Book Assigner */}
                  <div className="border border-gray-800 rounded-xl p-4 bg-black">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-4 flex items-center">
                      Attach Books to Banner
                    </label>
                    <div className="flex flex-col md:flex-row gap-6">
                      
                      <div className="flex-1 relative">
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Search vault or press Enter for global search..." 
                            value={bannerSearchQuery} 
                            onChange={(e) => {
                              setBannerSearchQuery(e.target.value);
                              setHasPressedBannerEnter(false);
                              if (e.target.value === '') setBannerApiResults([]); // Clear results on empty
                            }} 
                            onKeyDown={(e) => e.key === 'Enter' && executeBannerSearch()}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pr-10 text-sm focus:outline-none focus:border-sky-500 mb-2" 
                          />
                          {bannerSearchQuery && (
                            <button 
                              onClick={() => { setBannerSearchQuery(''); setBannerApiResults([]); setHasPressedBannerEnter(false); }}
                              className="absolute right-3 top-3 text-gray-500 hover:text-white"
                              title="Clear Search"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        {isBannerSearching && <div className="text-xs text-sky-400 animate-pulse mb-2">Scanning global network...</div>}
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {bannerSearchQuery && displayBannerBooks.map((book, index) => {
                            if (!book.isbn13) return null; // CRITICAL FIX: Skip books without an ISBN so it doesn't crash the mapping
                            const isAdded = editingBanner.target_isbns?.includes(book.isbn13);
                            return (
                              <button 
                                key={`${book.isbn13}-${index}`}
                                onClick={() => addBannerBook(book)} 
                                disabled={isAdded}
                                className={`w-full text-left flex justify-between items-center p-3 rounded border transition-all ${isAdded ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed' : 'bg-sky-900/20 border-sky-900 hover:bg-sky-900/40 hover:border-sky-500'}`}
                              >
                                <div className="flex flex-col overflow-hidden pr-2">
                                  <span className={`text-sm font-bold truncate ${isAdded ? 'text-gray-500' : 'text-sky-100'}`}>{book.title}</span>
                                  <span className="text-xs text-gray-500 truncate">{book.author}</span>
                                </div>
                                {!isAdded && <span className="text-xs font-bold bg-sky-600 text-white px-2 py-1 rounded shrink-0">+ Add</span>}
                                {isAdded && <span className="text-xs font-bold text-gray-500 px-2 py-1 shrink-0">Attached</span>}
                              </button>
                            );
                          })}
                          {hasPressedBannerEnter && displayBannerBooks.length === 0 && !isBannerSearching && (
                            <div className="text-xs text-gray-500 p-2">No results found globally.</div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 border-l border-gray-800 pl-6">
                        <h3 className="text-xs font-bold text-emerald-400 mb-3">Attached Books ({editingBanner.target_isbns?.length || 0})</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {editingBanner.target_isbns?.map(isbn => {
                            const b = books.find(book => book.isbn13 === isbn);
                            return (
                              <div key={isbn} className="flex justify-between items-center p-3 bg-emerald-900/20 border border-emerald-900/50 rounded">
                                <span className="text-xs font-bold text-emerald-100 truncate pr-2">{b ? b.title : `ISBN: ${isbn}`}</span>
                                <button onClick={() => removeBannerIsbn(isbn)} className="text-xs font-bold text-red-400 hover:text-red-300 shrink-0">Remove</button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={editingBanner.is_published || false} onChange={e => setEditingBanner({...editingBanner, is_published: e.target.checked})} />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${editingBanner.is_published ? 'bg-emerald-500' : 'bg-gray-800'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${editingBanner.is_published ? 'translate-x-6' : ''}`}></div>
                      </div>
                      <span className={`ml-3 text-sm font-bold ${editingBanner.is_published ? 'text-emerald-400' : 'text-gray-500'}`}>{editingBanner.is_published ? 'LIVE ON STOREFRONT' : 'Draft Mode (Hidden)'}</span>
                    </label>

                    <button onClick={handleSaveBanner} className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors shadow-lg">Save Banner</button>
                  </div>
                  {bannerStatus && <div className="text-right text-xs font-mono text-emerald-400">{bannerStatus}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            TAB: BROADCAST (ONLINE STATE)
            ========================================= */}
        {activeTab === 'broadcast' && (
          <div className="w-full max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 relative overflow-hidden animate-in fade-in duration-300">
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
                <div className={`mt-4 p-4 rounded-lg text-sm font-mono border ${bcStatus.isError ? 'bg-red-950/50 border-red-900 text-red-400' : 'bg-emerald-950/50 border-emerald-900 text-emerald-400'}`}>
                  {bcStatus.message}
                </div>
              )}
            </form>
          </div>
        )}

        {/* =========================================
            TAB: ACCOUNTS (ONLINE STATE)
            ========================================= */}
        {activeTab === 'accounts' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-lg font-bold text-sky-400">Platform Registry</h2>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="Admin Secret..." className="bg-black border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sky-500 text-gray-300 w-full sm:w-auto" />
                <button onClick={fetchAccounts} disabled={!adminSecret} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto whitespace-nowrap ${!adminSecret ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white'}`}>
                  Sync Registry
                </button>
              </div>
            </div>
            
            {accountsStatus && <div className="text-sm font-mono text-sky-400 mb-4">{accountsStatus}</div>}
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Email</th>
                    <th className="px-4 py-3">Account Created</th>
                    <th className="px-4 py-3 rounded-tr-lg">Last Sign In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {accounts.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-600 font-mono">No accounts loaded. Enter Admin Secret and sync.</td></tr>
                  ) : (
                    accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-gray-800/50 transition-colors">
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

      </div>
    </main>
  );
}