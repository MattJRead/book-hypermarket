'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell({ userId, isDarkMode = true }: { userId: string | null, isDarkMode?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchNotifications() {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && !error) setNotifications(data);
    }

    fetchNotifications();

    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  };

  if (!userId) return null; // Don't show the bell if not logged in

  return (
    <div className="fixed top-6 right-6 z-50" ref={dropdownRef}>
      {/* THE BELL BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`relative p-3 rounded-full transition-transform hover:scale-110 shadow-lg ${isDarkMode ? 'bg-gray-900 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-gray-950">
            {unreadCount}
          </span>
        )}
      </button>

      {/* THE DROPDOWN PANEL */}
      {isOpen && (
        <div className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl shadow-2xl border overflow-hidden transition-all origin-top-right ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`px-4 py-3 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <h3 className="font-bold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-bold text-sky-500 hover:text-sky-400 transition-colors">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">You have no notifications.</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`block p-4 border-b last:border-b-0 cursor-pointer transition-colors ${!notif.is_read ? (isDarkMode ? 'bg-sky-900/20' : 'bg-sky-50') : (isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50')} ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-500">{notif.type.replace('_', ' ')}</span>
                    {!notif.is_read && <span className="w-2 h-2 rounded-full bg-sky-500 mt-1"></span>}
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notif.title}</h4>
                  <p className={`text-xs line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{notif.message}</p>
                  {notif.action_url && (
                    <Link href={notif.action_url} className="inline-block mt-2 text-xs font-bold text-emerald-500 hover:text-emerald-400">
                      View Details →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}