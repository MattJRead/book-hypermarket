'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useParams } from 'next/navigation';
import ClubSettings from '../../../../components/ClubSettings';

export default function SettingsTab() {
  const params = useParams();
  const id = params?.id as string;
  
  const [club, setClub] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettingsData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Correctly querying your 'clubs' table based on your original code
      const { data: clubData } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single();

      if (clubData) {
        setClub(clubData);
        // Grants Creator/Admin settings if the current user owns the club
        setIsAdmin(clubData.creator_id === session.user.id);
      }
      
      setIsLoading(false);
    }
    
    if (id) loadSettingsData();
  }, [id]);

  if (isLoading) return <div className="p-12 text-center text-[#00bfff] animate-pulse font-mono">[ Accessing Settings Vault... ]</div>;
  if (!club) return <div className="p-12 text-center text-red-500 font-bold">Error loading club settings.</div>;

  return (
    <div className="mt-4">
      <ClubSettings 
        isAdmin={isAdmin} 
        clubName={club.name} 
        onSaveAdminSettings={async (settings) => {
          // Future integration: update the 'clubs' table with these settings
          console.log("Admin Settings Payload:", settings);
          alert("Club settings updated successfully.");
        }}
        onSaveMemberSettings={async (settings) => {
          // Future integration: update the 'club_members' table with preferences
          console.log("Member Settings Payload:", settings);
          alert("Personal preferences saved.");
        }}
      />
    </div>
  );
}