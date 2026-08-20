'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import FloatingMenu from '../../../components/FloatingMenu';
import ClubSettings from '../../../components/ClubSettings';
import Link from 'next/link';

export default function BookClubDashboard({ params }: { params: { id: string } }) {
  const [club, setClub] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // View Controller: discussions | quotes | settings
  const [activeTab, setActiveTab] = useState<'discussions' | 'quotes' | 'settings'>('discussions');

  useEffect(() => {
    async function loadDashboard() {
      // 1. Authenticate User
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }
      setUser(session.user);

      // 2. Fetch Club Data (Replace 'book_clubs' with your actual table name if different)
      const { data: clubData } = await supabase
        .from('book_clubs')
        .select('*')
        .eq('id', params.id)
        .single();
        
      if (clubData) {
        setClub(clubData);
        // Check if the current user created the club to grant Admin privileges
        setIsAdmin(clubData.creator_id === session.user.id);
      }
      setIsLoading(false);
    }
    loadDashboard();
  }, [params.id]);

  const handleSaveAdminSettings = async (settings: any) => {
    // Logic to save overarching club settings to Supabase
    console.log("Saving Admin Settings:", settings);
    alert("Club settings updated successfully.");
  };

  const handleSaveMemberSettings = async (settings: any) => {
    // Logic to save personal spoiler/privacy preferences to Supabase
    console.log("Saving Member Preferences:", settings);
    alert("Personal preferences saved.");
  };

  if (isLoading) return <main className="min-h-screen flex justify-center items-center bg-transparent"><div className="w-10 h-10 border-4 border-[#00bfff] border-t-transparent rounded-full animate-spin"></div></main>;
  if (!user) return <main className="min-h-screen flex justify-center items-center bg-transparent"><Link href="/login" className="bg-[#00bfff] text-white px-6 py-2 rounded-full font-bold hover:opacity-80 transition">Please Login</Link></main>;
  if (!club) return <main className="min-h-screen flex justify-center items-center bg-transparent"><div className="theme-element p-8 rounded-3xl border text-center font-bold">Book Club Not Found.</div></main>;

  return (
    <main className="min-h-screen flex flex-col p-6 md:p-12 relative overflow-hidden bg-transparent">
      <div className="relative z-10 w-full max-w-5xl mx-auto mt-8">
        
        {/* CLUB HEADER */}
        <div className="theme-element flex flex-col md:flex-row justify-between items-center mb-8 gap-6 p-6 md:p-8 rounded-3xl border">
          <div className="flex flex-col">
             <h1 className="text-4xl font-black mb-2">{club.name || 'Untitled Book Club'}</h1>
             <p className="font-medium opacity-70">Currently Reading: <span className="font-bold text-[#00bfff]">{club.current_book || 'Voting in Progress'}</span></p>
          </div>
          {isAdmin && (
            <div className="px-4 py-2 border border-[#00bfff] text-[#00bfff] font-bold text-xs uppercase tracking-widest rounded-lg">
              Admin Shield Active
            </div>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => setActiveTab('discussions')} 
            className={`flex-1 min-w-[150px] py-4 font-bold rounded-2xl transition-all border ${activeTab === 'discussions' ? 'bg-[#00bfff] text-white border-transparent' : 'theme-element hover:opacity-70'}`}
          >
            Discussions
          </button>
          <button 
            onClick={() => setActiveTab('quotes')} 
            className={`flex-1 min-w-[150px] py-4 font-bold rounded-2xl transition-all border ${activeTab === 'quotes' ? 'bg-[#00bfff] text-white border-transparent' : 'theme-element hover:opacity-70'}`}
          >
            Quote Board
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex-1 min-w-[150px] py-4 font-bold rounded-2xl transition-all border ${activeTab === 'settings' ? 'bg-[#00bfff] text-white border-transparent' : 'theme-element hover:opacity-70'}`}
          >
            Settings
          </button>
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="w-full">
          
          {activeTab === 'discussions' && (
            <div className="theme-element border rounded-3xl p-8 animate-in fade-in duration-300 flex flex-col items-center justify-center min-h-[400px]">
               {/* Replace this placeholder with your actual thread mapping logic */}
               <svg className="w-16 h-16 opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
               <h3 className="text-xl font-bold opacity-50">Spoiler-Locked Threads</h3>
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="theme-element border rounded-3xl p-8 animate-in fade-in duration-300 flex flex-col items-center justify-center min-h-[400px]">
               {/* Replace this placeholder with your actual sticky note mapping logic */}
               <svg className="w-16 h-16 opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
               <h3 className="text-xl font-bold opacity-50">Spoiler-Locked Quotes</h3>
            </div>
          )}

          {activeTab === 'settings' && (
            <ClubSettings 
              isAdmin={isAdmin} 
              clubName={club.name} 
              onSaveAdminSettings={handleSaveAdminSettings} 
              onSaveMemberSettings={handleSaveMemberSettings} 
            />
          )}

        </div>
      </div>
      
      <FloatingMenu />
    </main>
  );
}