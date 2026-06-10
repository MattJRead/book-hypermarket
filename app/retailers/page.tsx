'use client';

import FloatingMenu from '../../components/FloatingMenu';
import { useState } from 'react';
import Link from 'next/link';
// Note: Depending on where your lib folder is, you may need to add an extra '../' to this path
import { supabase } from '../../lib/supabase'; 
import { SpeedInsights } from "@vercel/speed-insights/next"   

export default function RetailersPage() {
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
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-16 px-6">
      <Link href="/" className="absolute top-8 left-8 text-sky-400 hover:text-sky-300 font-bold tracking-wide flex items-center gap-2">
        <span>←</span> Return to Storefront
      </Link>

      <div className="max-w-2xl w-full mt-12">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
          Next-Gen <span className="text-sky-400 italic">Point of Sale</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          We are building the ultimate aggregation and sales infrastructure for independent booksellers and comic shops. Join the waitlist to secure early access and shape the development of the software.
        </p>

        {status === 'success' ? (
          <div className="bg-sky-900/30 border border-sky-500/50 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-sky-400 mb-2">Transmission Received</h3>
            <p className="text-gray-300">You are on the list. We will be in touch shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Your Name</label>
                <input required type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Shop / Company Name</label>
                <input required type="text" onChange={(e) => setFormData({...formData, company: e.target.value})} className="bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
              <input required type="email" onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Current POS Software</label>
              <input type="text" placeholder="e.g. Square, Shopify, Lightspeed, Custom..." onChange={(e) => setFormData({...formData, pos_system: e.target.value})} className="bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Database Infrastructure</label>
              <select required onChange={(e) => setFormData({...formData, infrastructure: e.target.value})} className="bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
                <option value="">Select your current setup...</option>
                <option value="Cloud/Online">Cloud / Online Software</option>
                <option value="Local Computer">Local Computer / Hard Drive</option>
                <option value="Paper">Pen & Paper / Manual</option>
                <option value="Not Sure">Not Sure</option>
              </select>
            </div>

            <button disabled={status === 'loading'} type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-gray-950 font-bold text-lg py-4 rounded-lg transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:opacity-50">
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