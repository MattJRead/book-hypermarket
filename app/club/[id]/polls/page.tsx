'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useParams } from 'next/navigation';

export default function PollsPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [clubAdminId, setClubAdminId] = useState<string | null>(null);
  const [polls, setPolls] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now()); // Powers the live countdown ticker

  // Form State for Admin
  const [question, setQuestion] = useState('');
  const [pollEndDate, setPollEndDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Advanced Options Builder
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [currentOptionText, setCurrentOptionText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const STANDARD_CATEGORIES = ['Horror', 'Biography', 'Anime', 'Sci-Fi', 'Fantasy', 'Romance', 'Thriller', 'Non-Fiction', 'Mystery'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });
    
    // Start the master clock for live countdowns
    const ticker = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const fetchPollData = async () => {
    const { data: club } = await supabase.from('clubs').select('creator_id').eq('id', id).single();
    if (club) setClubAdminId(club.creator_id);

    const { data: pollsData } = await supabase.from('polls').select('*').eq('club_id', id).order('created_at', { ascending: false });
    if (pollsData) setPolls(pollsData);

    const { data: votesData } = await supabase.from('poll_votes').select('*');
    if (votesData) setVotes(votesData);

    setIsLoading(false);
  };

  useEffect(() => { if (id) fetchPollData(); }, [id]);

  // Live Search Engine for Poll Options
  useEffect(() => {
    const searchOptions = async () => {
      if (currentOptionText.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/live-search?q=${encodeURIComponent(currentOptionText)}`);
        const data = await res.json();
        if (data.success && data.books) setSearchResults(data.books.slice(0, 4));
      } catch (e) {}
    };
    const debounce = setTimeout(searchOptions, 400);
    return () => clearTimeout(debounce);
  }, [currentOptionText]);

  const handleAddOption = (text: string) => {
    if (!text.trim() || optionsList.includes(text.trim())) return;
    setOptionsList([...optionsList, text.trim()]);
    setCurrentOptionText('');
    setSearchResults([]);
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (optionsList.length < 2) return alert("You must provide at least two options.");
    if (!pollEndDate) return alert("You must set an end date and time.");
    
    setIsCreating(true);
    await supabase.from('polls').insert({
      club_id: id,
      creator_id: user.id,
      question: question,
      options: optionsList,
      ends_at: new Date(pollEndDate).toISOString()
    });

    setQuestion('');
    setOptionsList([]);
    setPollEndDate('');
    setIsCreating(false);
    fetchPollData();
  };

  const handleVote = async (pollId: string, selectedOption: string) => {
    if (!user) return;
    await supabase.from('poll_votes').upsert(
      { poll_id: pollId, user_id: user.id, selected_option: selectedOption },
      { onConflict: 'poll_id, user_id' }
    );
    fetchPollData();
  };

  const formatCountdown = (endTime: string) => {
    const total = Date.parse(endTime) - currentTime;
    if (total <= 0) return 'Poll Closed';
    const d = Math.floor(total / (1000 * 60 * 60 * 24));
    const h = Math.floor((total / (1000 * 60 * 60)) % 24);
    const m = Math.floor((total / 1000 / 60) % 60);
    const s = Math.floor((total / 1000) % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const matchedCategories = STANDARD_CATEGORIES.filter(c => c.toLowerCase().includes(currentOptionText.toLowerCase()));

  return (
    <div className="mt-4 space-y-8 pb-12">
      
      {/* PREMIUM ADMIN CONTROL PANEL */}
      {user?.id === clubAdminId && (
        <form onSubmit={handleCreatePoll} className="bg-gray-800/60 p-6 md:p-10 rounded-2xl border border-gray-700 shadow-xl backdrop-blur-md relative overflow-visible">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl"></div>
          
          <h2 className="text-2xl font-black text-white mb-6">Launch a New Poll</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">The Question</label>
              <input type="text" required value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Which genre should we conquer next?" className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition text-lg" />
            </div>
            
            <div className="relative">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Build Options List</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={currentOptionText} 
                  onChange={(e) => setCurrentOptionText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(currentOptionText); } }}
                  placeholder="Search a book, genre, or type a custom option..." 
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition" 
                />
                <button type="button" onClick={() => handleAddOption(currentOptionText)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 rounded-xl transition shadow-md">Add</button>
              </div>

              {/* Dynamic Suggestions Dropdown */}
              {currentOptionText.trim().length > 0 && (
                <div className="absolute w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden z-30">
                  <div onClick={() => handleAddOption(currentOptionText)} className="p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer flex justify-between items-center text-blue-400 font-bold text-sm">
                    <span>Add "{currentOptionText}" as custom text</span> <span>+</span>
                  </div>
                  {matchedCategories.map((cat, i) => (
                    <div key={`cat-${i}`} onClick={() => handleAddOption(cat)} className="p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                      <span className="bg-purple-900/50 text-purple-400 text-[10px] uppercase font-bold px-2 py-1 rounded">Genre</span>
                      <span className="text-white font-bold">{cat}</span>
                    </div>
                  ))}
                  {searchResults.map((book) => (
                    <div key={book.id} onClick={() => handleAddOption(`${book.title} - ${book.author}`)} className="p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                      <span className="bg-emerald-900/50 text-emerald-400 text-[10px] uppercase font-bold px-2 py-1 rounded">Book</span>
                      <span className="text-white font-bold">{book.title}</span> <span className="text-gray-400 text-xs">- {book.author}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Render Selected Options */}
              {optionsList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
                  {optionsList.map((opt, i) => (
                    <div key={i} className="bg-blue-900/40 border border-blue-500/50 text-blue-100 text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                      {opt}
                      <button type="button" onClick={() => setOptionsList(optionsList.filter(o => o !== opt))} className="text-blue-400 hover:text-red-400">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Exact Time Limit</label>
              <input type="datetime-local" required value={pollEndDate} onChange={(e) => setPollEndDate(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white focus:border-blue-500 outline-none color-scheme-dark transition" />
            </div>

            <button type="submit" disabled={isCreating || optionsList.length < 2} className={`w-full font-black py-4 rounded-xl transition-all shadow-xl mt-4 ${isCreating || optionsList.length < 2 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02]'}`}>
              {isCreating ? 'Deploying...' : 'Deploy Poll to Network'}
            </button>
          </div>
        </form>
      )}

      {/* THE POLL FEED */}
      <div className="space-y-6">
        {polls.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-bold border border-gray-800 rounded-2xl bg-gray-900/30">
            No active polls currently deployed.
          </div>
        ) : (
          polls.map(poll => {
            const isClosed = currentTime > Date.parse(poll.ends_at);
            const myVote = votes.find(v => v.poll_id === poll.id && v.user_id === user?.id)?.selected_option;
            const timeString = formatCountdown(poll.ends_at);

            return (
              <div key={poll.id} className={`p-6 md:p-8 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${isClosed ? 'bg-gray-900/80 border-gray-800 opacity-75' : 'bg-gray-800/90 border-gray-600 relative overflow-hidden'}`}>
                
                {!isClosed && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b border-gray-700 pb-4 gap-4">
                  <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">{poll.question}</h3>
                  
                  {/* LIVE TICKING COUNTDOWN */}
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{isClosed ? 'Status' : 'Time Remaining'}</p>
                    <span className={`inline-block font-mono font-bold px-4 py-2 rounded-lg border shadow-inner tracking-widest ${isClosed ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-900 text-blue-400 border-blue-900/50'}`}>
                      {timeString}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {poll.options.map((option: string, idx: number) => {
                    const voteCount = votes.filter(v => v.poll_id === poll.id && v.selected_option === option).length;
                    const totalVotes = votes.filter(v => v.poll_id === poll.id).length;
                    const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
                    const isMyChoice = myVote === option;

                    return (
                      <label 
                        key={idx} 
                        className={`relative flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${isClosed ? 'cursor-default' : 'hover:bg-gray-700/80 hover:scale-[1.01]'} ${isMyChoice ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-gray-900/50 border-gray-700'}`}
                      >
                        {/* Progress Bar Background (Only shows after voting or when closed) */}
                        {(myVote || isClosed) && (
                          <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out z-0 ${isMyChoice ? 'bg-blue-900/30' : 'bg-gray-800/50'}`} style={{ width: `${percentage}%` }}></div>
                        )}

                        <div className="flex items-center gap-4 z-10">
                          <input 
                            type="radio" 
                            name={`poll-${poll.id}`} 
                            value={option}
                            checked={isMyChoice}
                            disabled={isClosed}
                            onChange={() => handleVote(poll.id, option)}
                            className="w-5 h-5 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                          />
                          <span className={`text-lg font-bold ${isMyChoice ? 'text-white drop-shadow-md' : 'text-gray-300'}`}>{option}</span>
                        </div>
                        
                        {(myVote || isClosed) && (
                          <div className="z-10 flex flex-col items-end">
                            <span className="text-sm font-black text-white">{percentage}%</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{voteCount} Votes</span>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}