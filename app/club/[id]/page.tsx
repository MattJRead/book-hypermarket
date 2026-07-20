import { supabase } from '../../../lib/supabase';
import UpdateProgress from './UpdateProgress';

export default async function ClubDashboard({ 
  params 
}: { 
  params: Promise<{ id: string }> // Updated to Promise
}) {
  // Await the params before extracting the ID
  const { id } = await params;

  // 1. Fetch the members of this specific club
  const { data: members } = await supabase
    .from('club_members')
    .select('*')
    .eq('club_id', id);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6 shadow-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-2">Reading Progress</h2>
        
        <div className="space-y-8">
          {members?.map((member) => {
            // 2. The Universal Percentage Calculation
            const percentage = Math.min(
              Math.round((member.current_position / member.total_length) * 100), 
              100
            );
            
            // 3. Dynamic Format Display Logic
            const positionText = member.reading_format === 'Audiobook' 
              ? `Chapter ${member.current_position}`
              : `Page ${member.current_position}`;

            return (
              <div key={member.user_id} className="w-full">
                
                {/* Status Header */}
                <div className="flex justify-between items-end mb-2">
                  <span className="font-semibold text-gray-200">
                    Reader {member.user_id.substring(0,5)}
                  </span>
                  <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                    {member.reading_format} • {positionText}
                  </span>
                </div>

                {/* The Background Track */}
                <div className="w-full bg-gray-700 rounded-full h-6 relative overflow-hidden border border-gray-600">
                  
                  {/* The Blue Progress Fill */}
                  <div 
                    className="bg-blue-500 h-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                  
                  {/* The Percentage Label */}
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference pointer-events-none">
                    {percentage}% Complete
                  </div>

                </div>
                <UpdateProgress clubId={id} />
              </div>
            );
          })}
          
          {members?.length === 0 && (
            <p className="text-gray-400 italic">No members have joined this club yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}