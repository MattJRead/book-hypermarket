'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  action_url?: string;
  created_at: string;
};

export default function NotificationBell({ userId, isDarkMode }: { userId: string | null, isDarkMode: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch un-dismissed notifications from the last 30 days
    async function fetchNotifications() {
      // Check the browser's memory for notifications the user already closed
      const savedDismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');

      // Calculate the date 30 days ago to prevent pulling ancient data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (data) {
        // Filter out the ones this specific user has already dismissed
        const active = data.filter(n => !savedDismissed.includes(n.id));
        setNotifications(active);
      }
    }
    
    fetchNotifications();

    // Close the inbox if the user clicks anywhere else on the screen
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. The Dismiss Mechanism
  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents accidentally clicking a link while dismissing
    const savedDismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    const updatedDismissed = [...savedDismissed, id];
    
    // Save to browser memory so it stays gone even if they refresh
    localStorage.setItem('dismissed_notifications', JSON.stringify(updatedDismissed));
    
    // Visually remove it from the list instantly
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    const savedDismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('dismissed_notifications', JSON.stringify([...savedDismissed, ...allIds]));
    setNotifications([]);
  };

  return (
    <div className="fixed top-6 right-6 z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-full shadow-lg transition-transform hover:scale-110 ${isDarkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full shadow-md">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-3 w-80 md:w-96 rounded-2xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'}`}>
            <h3 className="font-bold text-lg">Inbox</h3>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-xs font-bold text-sky-500 hover:text-sky-400 transition-colors">Clear All</button>
            )}
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-transparent">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-mono text-sm">You are all caught up.</div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-5 relative group hover:bg-black/10 transition-colors ${notif.action_url ? 'cursor-pointer hover:bg-sky-900/10' : ''}`} onClick={() => notif.action_url && window.open(notif.action_url, '_blank')}>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${notif.type === 'alert' ? 'border-red-500 text-red-500 bg-red-500/10' : notif.type === 'new_release' ? 'border-purple-500 text-purple-500 bg-purple-500/10' : 'border-sky-500 text-sky-500 bg-sky-500/10'}`}>
                        {notif.type.replace('_', ' ')}
                      </span>
                      <button onClick={(e) => dismissNotification(notif.id, e)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1" title="Dismiss">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <h4 className="font-bold text-base mb-2">{notif.title}</h4>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{notif.message}</p>
                    <div className="text-[10px] text-gray-500 font-mono mt-4 text-right">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}