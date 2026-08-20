'use client';

import { useState } from 'react';

type ClubSettingsProps = {
  isAdmin: boolean;
  clubName: string;
  onSaveAdminSettings?: (settings: any) => void;
  onSaveMemberSettings?: (settings: any) => void;
};

export default function ClubSettings({ isAdmin, clubName, onSaveAdminSettings, onSaveMemberSettings }: ClubSettingsProps) {
  const [activeTab, setActiveTab] = useState<'member' | 'admin'>(isAdmin ? 'admin' : 'member');

  // Admin States
  const [pacingMode, setPacingMode] = useState('free-read');
  const [unlockSchedule, setUnlockSchedule] = useState('manual');
  const [visibility, setVisibility] = useState('public');

  // Member States
  const [autoUnlock, setAutoUnlock] = useState(true);
  const [masterOverride, setMasterOverride] = useState(false);
  const [shareProgress, setShareProgress] = useState(true);

  return (
    <div className="w-full max-w-3xl mx-auto theme-element border rounded-3xl p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 border-inherit">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1">Club Settings</h2>
          <p className="text-sm font-medium opacity-70">Managing preferences for {clubName}</p>
        </div>
      </div>

      {/* TABS (Only visible if Admin) */}
      {isAdmin && (
        <div className="flex p-1 mb-8 theme-element border rounded-xl">
          <button 
            onClick={() => setActiveTab('admin')} 
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'admin' ? 'bg-[#00bfff] text-white' : 'hover:opacity-70'}`}
          >
            👑 Creator Controls
          </button>
          <button 
            onClick={() => setActiveTab('member')} 
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'member' ? 'bg-[#00bfff] text-white' : 'hover:opacity-70'}`}
          >
            👤 My Preferences
          </button>
        </div>
      )}

      {/* ADMIN SETTINGS PANEL */}
      {activeTab === 'admin' && isAdmin && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-widest opacity-80 border-b border-inherit pb-2">The Pacing Engine</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Pacing Mode</label>
              <select 
                value={pacingMode} 
                onChange={(e) => setPacingMode(e.target.value)}
                className="w-full theme-element border rounded-xl p-4 focus:outline-none focus:border-[#00bfff] transition cursor-pointer appearance-none"
              >
                <option value="free-read">Free-Read (All chapters exist, unlocked individually)</option>
                <option value="guided">Guided Reading (Only current week's chapters visible)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Chapter Unlocking Schedule</label>
              <select 
                value={unlockSchedule} 
                onChange={(e) => setUnlockSchedule(e.target.value)}
                className="w-full theme-element border rounded-xl p-4 focus:outline-none focus:border-[#00bfff] transition cursor-pointer appearance-none"
              >
                <option value="manual">Manual (Admin clicks to reveal next chapter)</option>
                <option value="automated">Automated (Unlocks on specific calendar dates)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-widest opacity-80 border-b border-inherit pb-2">Access & Privacy</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Club Visibility</label>
              <select 
                value={visibility} 
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full theme-element border rounded-xl p-4 focus:outline-none focus:border-[#00bfff] transition cursor-pointer appearance-none"
              >
                <option value="public">Public (Visible in search, open to all)</option>
                <option value="unlisted">Unlisted (Hidden from search, link required)</option>
                <option value="private">Private (Invite only, manual approval)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={() => onSaveAdminSettings?.({ pacingMode, unlockSchedule, visibility })}
            className="w-full bg-[#00bfff] hover:bg-[#009acd] text-white font-bold py-4 rounded-xl transition-all border border-transparent"
          >
            Save Admin Settings
          </button>
        </div>
      )}

      {/* MEMBER SETTINGS PANEL */}
      {activeTab === 'member' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-widest opacity-80 border-b border-inherit pb-2">The Spoiler Engine</h3>
            
            <label className="flex items-center justify-between p-4 theme-element border rounded-xl cursor-pointer hover:border-[#00bfff] transition-colors">
              <div>
                <p className="font-bold text-base">Smart Auto-Unlock</p>
                <p className="text-xs opacity-60 mt-1">Automatically remove blur on threads prior to your logged "Current Chapter".</p>
              </div>
              <input type="checkbox" checked={autoUnlock} onChange={(e) => setAutoUnlock(e.target.checked)} className="w-6 h-6 accent-[#00bfff] cursor-pointer" />
            </label>

            <label className="flex items-center justify-between p-4 theme-element border rounded-xl cursor-pointer hover:border-[#00bfff] transition-colors">
              <div>
                <p className="font-bold text-base">Master Spoiler Override</p>
                <p className="text-xs opacity-60 mt-1">Disable all blur protections. (Recommended for re-reads only).</p>
              </div>
              <input type="checkbox" checked={masterOverride} onChange={(e) => setMasterOverride(e.target.checked)} className="w-6 h-6 accent-red-500 cursor-pointer" />
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-widest opacity-80 border-b border-inherit pb-2">Privacy</h3>
            
            <label className="flex items-center justify-between p-4 theme-element border rounded-xl cursor-pointer hover:border-[#00bfff] transition-colors">
              <div>
                <p className="font-bold text-base">Share Reading Progress</p>
                <p className="text-xs opacity-60 mt-1">Allow fellow club members to see your current percentage and chapter.</p>
              </div>
              <input type="checkbox" checked={shareProgress} onChange={(e) => setShareProgress(e.target.checked)} className="w-6 h-6 accent-[#00bfff] cursor-pointer" />
            </label>
          </div>

          <button 
            onClick={() => onSaveMemberSettings?.({ autoUnlock, masterOverride, shareProgress })}
            className="w-full bg-[#00bfff] hover:bg-[#009acd] text-white font-bold py-4 rounded-xl transition-all border border-transparent"
          >
            Save My Preferences
          </button>
          
          <div className="pt-4 mt-8 border-t border-inherit">
             <button className="w-full py-4 font-bold text-red-500 hover:text-white hover:bg-red-600 border border-red-500/30 hover:border-red-600 rounded-xl transition-all">
               Leave Book Club
             </button>
          </div>
        </div>
      )}
    </div>
  );
}