'use client';

import { useState } from 'react';
import { castVote } from '../../actions/pollActions';

export default function ActivePoll({ clubId, poll, options, totalVotes }: any) {
  const [isVoting, setIsVoting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate time remaining for the UI
  const endTime = new Date(poll.end_time).getTime();
  const now = new Date().getTime();
  const isFinished = now > endTime;

  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6 shadow-xl border border-blue-900/50 mt-6 relative overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Next Book Poll</h2>
          <p className="text-sm text-gray-400">
            {isFinished ? 'The poll has concluded.' : 'Cast your vote for the next read.'}
          </p>
        </div>
        
        {/* Dynamic Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isFinished ? 'bg-gray-700 text-gray-300' : 'bg-blue-900/50 text-blue-400 border border-blue-800'}`}>
          {isFinished ? 'Closed' : 'Active'}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 text-xs font-bold text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4 relative z-10">
        {options.map((option: any) => {
          // Calculate the width of the visual vote bar
          const votePercentage = totalVotes === 0 ? 0 : Math.round((option.vote_count / totalVotes) * 100);

          return (
            <div key={option.id} className="relative w-full bg-gray-900 border border-gray-700 rounded-md overflow-hidden">
              
              {/* Background Fill for Votes */}
              <div 
                className="absolute top-0 left-0 h-full bg-blue-900/40 transition-all duration-1000 ease-out"
                style={{ width: `${votePercentage}%` }}
              ></div>

              <div className="relative z-10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {/* Placeholder for Book Cover Thumbnail */}
                  <div className="w-8 h-12 bg-gray-700 rounded shadow border border-gray-600"></div>
                  <span className="font-bold text-gray-200">ISBN: {option.isbn}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-400">{votePercentage}%</span>
                  
                  {!isFinished && (
                    <form action={async (formData) => {
                      setIsVoting(true);
                      setErrorMsg('');
                      try {
                        await castVote(formData);
                      } catch (err: any) {
                        setErrorMsg(err.message);
                      }
                      setIsVoting(false);
                    }}>
                      <input type="hidden" name="clubId" value={clubId} />
                      <input type="hidden" name="pollId" value={poll.id} />
                      <input type="hidden" name="optionId" value={option.id} />
                      <button 
                        type="submit" 
                        disabled={isVoting}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded transition disabled:opacity-50"
                      >
                        Vote
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}