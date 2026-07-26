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

  // Form State for Admin
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [hoursToRun, setHoursToRun] = useState('24');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });
  }, []);

  const fetchPollData = async () => {
    // 1. Check who owns the club
    const { data: club } = await supabase.from('clubs').select('creator_id').eq('id', id).single();
    if (club) setClubAdminId(club.creator_id);

    // 2. Fetch all polls for this club
    const { data: pollsData } = await supabase.from('polls').select('*').eq('club_id', id).order('created_at', { ascending: false });
    if (pollsData) setPolls(pollsData);

    // 3. Fetch all votes for these polls
    const { data: votesData } = await supabase.from('poll_votes').select('*');
    if (votesData) setVotes(votesData);

    setIsLoading(false);
  };

  useEffect(() => {
    if (id) fetchPollData();
  }, [id]);

  // Admin function to launch a new poll
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const optionsArray = options.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
    const endsAt = new Date(Date.now() + parseInt(hoursToRun) * 60 * 60 * 1000).toISOString();

    await supabase.from('polls').insert({
      club_id: id,
      creator_id: user.id,
      question: question,
      options: optionsArray,
      ends_at: endsAt
    });

    setQuestion('');
    setOptions('');
    setIsCreating(false);
    fetchPollData();
  };

  // User function to cast or change a vote
  const handleVote = async (pollId: string, selectedOption: string) => {
    if (!user) return;
    
    // Upsert seamlessly overwrites their old vote if they change their mind
    await supabase.from('poll_votes').upsert(
      { poll_id: pollId, user_id: user.id, selected_option: selectedOption },
      { onConflict: 'poll_id, user_id' }
    );
    
    fetchPollData();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-8">
      
      {/* ADMIN CONTROL PANEL: Only visible to the Club Creator */}
      {user?.id === clubAdminId && (
        <form onSubmit={handleCreatePoll} className="bg-gray-800/60 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-lg backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-4">Create a New Poll</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">The Question</label>
              <input type="text" required value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Which book should we read next?" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Options (Comma Separated)</label>
              <input type="text" required value={options} onChange={(e) => setOptions(e.target.value)} placeholder="e.g. Mort, Guards! Guards!, Small Gods" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Time Limit</label>
              <select value={hoursToRun} onChange={(e) => setHoursToRun(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (1 Day)</option>
                <option value="72">72 Hours (3 Days)</option>
                <option value="168">1 Week</option>
              </select>
            </div>
            <button type="submit" disabled={isCreating} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition shadow-lg mt-2">
              {isCreating ? 'Launching Poll...' : 'Launch Poll'}
            </button>
          </div>
        </form>
      )}

      {/* THE POLL FEED */}
      <div className="space-y-6">
        {polls.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-bold border border-gray-800 rounded-2xl bg-gray-900/30">
            No active polls to vote on.
          </div>
        ) : (
          polls.map(poll => {
            const isClosed = new Date() > new Date(poll.ends_at);
            const myVote = votes.find(v => v.poll_id === poll.id && v.user_id === user?.id)?.selected_option;
            
            // Calculate remaining time
            const total = Date.parse(poll.ends_at) - Date.parse(new Date().toString());
            const h = Math.max(0, Math.floor((total / (1000 * 60 * 60)) % 24));
            const d = Math.max(0, Math.floor(total / (1000 * 60 * 60 * 24)));
            const timeString = isClosed ? 'Poll Closed' : `${d}d ${h}h Remaining`;

            return (
              <div key={poll.id} className={`p-6 md:p-8 rounded-2xl border shadow-lg backdrop-blur-md transition-all ${isClosed ? 'bg-gray-900/80 border-gray-800 opacity-70' : 'bg-gray-800/80 border-gray-600'}`}>
                
                <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
                  <h3 className="text-2xl font-black text-white leading-tight pr-4">{poll.question}</h3>
                  <span className={`shrink-0 text-xs font-mono px-3 py-1.5 rounded-full border shadow-inner ${isClosed ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-red-900/30 text-red-400 border-red-800/50 animate-pulse'}`}>
                    {timeString}
                  </span>
                </div>

                <div className="space-y-3">
                  {poll.options.map((option: string, idx: number) => {
                    const voteCount = votes.filter(v => v.poll_id === poll.id && v.selected_option === option).length;
                    const isMyChoice = myVote === option;

                    return (
                      <label 
                        key={idx} 
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${isClosed ? 'cursor-default' : 'hover:bg-gray-700/50'} ${isMyChoice ? 'bg-blue-900/20 border-blue-500' : 'bg-gray-900/50 border-gray-700'}`}
                      >
                        <div className="flex items-center gap-4">
                          <input 
                            type="radio" 
                            name={`poll-${poll.id}`} 
                            value={option}
                            checked={isMyChoice}
                            disabled={isClosed}
                            onChange={() => handleVote(poll.id, option)}
                            className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className={`text-lg font-bold ${isMyChoice ? 'text-white' : 'text-gray-300'}`}>{option}</span>
                        </div>
                        
                        {/* Reveals vote counts slightly if the user has voted or if the poll is closed */}
                        {(myVote || isClosed) && (
                          <span className="text-sm font-mono text-gray-400 bg-gray-800 px-3 py-1 rounded-md shadow-inner">{voteCount} Votes</span>
                        )}
                      </label>
                    );
                  })}
                </div>
                
                {!isClosed && myVote && (
                  <p className="text-xs text-blue-400 mt-6 font-mono text-center">
                    Your vote is logged. You may change your mind until the timer runs out.
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}