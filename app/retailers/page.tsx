'use client';

import FloatingMenu from '../../components/FloatingMenu';
import { useState } from 'react';
import Link from 'next/link';
// Note: Depending on where your lib folder is, you may need to add an extra '../' to this path
import { supabase } from '../../lib/supabase'; 
import { SpeedInsights } from "@vercel/speed-insights/next"
import { useTheme } from '@/components/ThemeProvider';   

export default function RetailersPage() {
  // 1. Activate the theme brain
  const { theme } = useTheme();
  const isDarkUI = theme === 'dark' || theme === 'true-dark';

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    pos_system: '',
    infrastructure: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // 1. Drop the payload into the Supabase vault
    const { error } = await supabase.from('b2b_leads').insert([formData]);

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      // 2. Fire the tripwire to your inbox
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } catch (notifyError) {
        console.error("Tripwire misfired, but data was saved.", notifyError);
      }
      
      setStatus('success');
    }
  };

  return (
     // Added items-center to horizontally center the entire page content
     <main className="min-h-screen flex flex-col items-center py-12 relative overflow-hidden">
      
      {/* Constrained back button to align perfectly with the form below it */}
      <div className="w-full max-w-2xl px-6 z-10 mb-8 self-center">
        <Link href="/" className={`inline-flex font-bold tracking-wide items-center gap-2 transition-colors ${isDarkUI ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-500'}`}>
          <span>←</span> Return to Storefront
        </Link>
      </div>

      <div className="max-w-2xl w-full z-10 px-6">
        <h1 className={`text-5xl font-extrabold mb-4 tracking-tight transition-colors ${isDarkUI ? 'text-white' : 'text-gray-900'}`}>
          Next-Gen <span className="text-sky-500 italic">Point of Sale</span>
        </h1>
        <p className={`text-lg mb-10 leading-relaxed transition-colors ${isDarkUI ? 'text-gray-400' : 'text-gray-600'}`}>
          We are building the ultimate aggregation and sales infrastructure for independent booksellers and comic shops. Join the waitlist to secure early access and shape the development of the software.
        </p>

        {status === 'success' ? (
          <div className={`border rounded-xl p-8 text-center transition-colors ${isDarkUI ? 'bg-sky-900/30 border-sky-500/50' : 'bg-sky-50 border-sky-200'}`}>
            <h3 className={`text-2xl font-bold mb-2 ${isDarkUI ? 'text-sky-400' : 'text-sky-600'}`}>Transmission Received</h3>
            <p className={isDarkUI ? 'text-gray-300' : 'text-gray-700'}>You are on the list. We will be in touch shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`border rounded-2xl p-8 shadow-2xl space-y-6 transition-colors ${isDarkUI ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Your Name</label>
                <input required type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${isDarkUI ? 'bg-black border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Shop / Company Name</label>
                <input required type="text" onChange={(e) => setFormData({...formData, company: e.target.value})} className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${isDarkUI ? 'bg-black border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
              <input required type="email" onChange={(e) => setFormData({...formData, email: e.target.value})} className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${isDarkUI ? 'bg-black border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Current POS Software</label>
              <input type="text" placeholder="e.g. Square, Shopify, Lightspeed, Custom..." onChange={(e) => setFormData({...formData, pos_system: e.target.value})} className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${isDarkUI ? 'bg-black border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Database Infrastructure</label>
              <select required onChange={(e) => setFormData({...formData, infrastructure: e.target.value})} className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none transition-colors ${isDarkUI ? 'bg-black border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                <option value="">Select your current setup...</option>
                <option value="Cloud/Online">Cloud / Online Software</option>
                <option value="Local Computer">Local Computer / Hard Drive</option>
                <option value="Paper">Pen & Paper / Manual</option>
                <option value="Not Sure">Not Sure</option>
              </select>
            </div>

            <button disabled={status === 'loading'} type="submit" className={`w-full font-bold text-lg py-4 rounded-lg transition-all shadow-lg disabled:opacity-50 ${isDarkUI ? 'bg-sky-500 hover:bg-sky-400 text-gray-950 shadow-sky-500/20' : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'}`}>
              {status === 'loading' ? 'Initializing...' : 'Join the Waitlist'}
            </button>
            {status === 'error' && <p className="text-red-500 text-sm text-center mt-2">Error connecting to vault. Please try again.</p>}
          </form>
        )}
      </div>
      <FloatingMenu />
      <SpeedInsights />
    </main>
  );
}