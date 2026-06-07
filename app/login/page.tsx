'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserEmail(session.user.email || null);
      setIsChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/'); 
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ text: 'Success! Check your email for the confirmation link.', type: 'success' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/'); 
      }
    } catch (error: any) {
      setMessage({ text: error.message || 'An error occurred during authentication.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-sky-400 font-mono animate-pulse">
        [ Scanning Vault Credentials... ]
      </div>
    );
  }

  if (userEmail) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Vault Access Granted</h2>
          <p className="text-gray-400 mb-8">You are currently signed in as <br/><span className="text-sky-400 font-bold">{userEmail}</span></p>
          
          <div className="flex flex-col gap-4">
            <Link href="/" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg transition-colors">
              Return to Storefront
            </Link>
            
            {/* The renamed route */}
            <Link href="/bookshelf" className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg border border-gray-700 transition-colors">
              View My Bookshelf
            </Link>
            
            <button 
              onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} 
              className="mt-4 text-sm text-red-400 hover:text-red-300 font-bold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
        <h1 className="flex items-baseline font-extrabold tracking-tighter text-white">
          <span className="text-3xl lowercase">book</span>
          <span className="relative mx-1 text-4xl text-sky-400 italic inline-block px-1">
            Hyper
            <span className="absolute left-0 right-0 h-[3px] bg-gray-950 top-[54%] -translate-y-1/2"></span>
          </span>
          <span className="text-3xl lowercase">-market</span>
        </h1>
      </Link>

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isSignUp ? 'Create Your Vault Account' : 'Access Your Bookshelf'}
        </h2>

        {message && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-bold ${message.type === 'error' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors" placeholder="you@empire.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Processing...' : (isSignUp ? 'Forge Account' : 'Enter Vault')}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-800 pt-6">
          <button onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }} className="text-gray-400 hover:text-white text-sm transition-colors">
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </main>
  );
}