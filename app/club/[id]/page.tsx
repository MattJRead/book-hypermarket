import { supabase } from '../../../lib/supabase';
import UpdateProgress from './UpdateProgress';
import ActivePoll from './ActivePoll';

export default async function ClubDashboard({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // 1. Fetch the members of this specific club
  const { data: members } = await supabase
    .from('club_members')
    .select('*')
    .eq('club_id', id);

  // 2. Fetch the active poll (if one exists)
  const { data: activePoll } = await supabase
    .from('club_polls')
    .select('*')
    .eq('club_id', id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let optionsWithVotes: any[] = [];
  let totalVotes = 0;

  if (activePoll) {
    // 3. Fetch the poll options and their vote counts
    const { data: options } = await supabase
      .from('poll_options')
      .select('id, isbn, poll_votes(count)')
      .eq('poll_id', activePoll.id);

    if (options) {
      optionsWithVotes = options.map((opt: any) => {
        const count = opt.poll_votes[0]?.count || 0;
        totalVotes += count;
        return { ...opt, vote_count: count };
      });
    }
  }

  return (
    <div className="space-y-6">
      
      {/* The Reading Progress Bars */}
      <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6 shadow-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-2">Reading Progress</h2>
        
        <div className="space-y-8">
          {members?.map((member) => {
            const percentage = Math.min(
              Math.round((member.current_position / member.total_length) * 100), 
              100
            );
            
            const positionText = member.reading_format === 'Audiobook' 
              ? `Chapter ${member.current_position}`
              : `Page ${member.current_position}`;

            return (
              <div key={member.user_id} className="w-full">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-semibold text-gray-200">
                    Reader {member.user_id.substring(0,5)}
                  </span>
                  <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                    {member.reading_format} • {positionText}
                  </span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-6 relative overflow-hidden border border-gray-600">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference pointer-events-none">
                    {percentage}% Complete
                  </div>
                </div>
              </div>
            );
          })}
          
          {members?.length === 0 && (
            <p className="text-gray-400 italic">No members have joined this club yet.</p>
          )}
        </div>
      </div>

      {/* The Update Progress Form */}
      <UpdateProgress clubId={id} />

      {/* Conditionally render the active poll if one exists */}
      {activePoll && (
        <ActivePoll 
          clubId={id} 
          poll={activePoll} 
          options={optionsWithVotes} 
          totalVotes={totalVotes} 
        />
      )}
      
    </div>
  );
}