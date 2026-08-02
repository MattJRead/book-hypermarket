'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams } from 'next/navigation';

export default function ClubDashboard() {
  const params = useParams();
  const id = params?.id as string;
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [club, setClub] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [bookTitle, setBookTitle] = useState('Resolving title...');
  const [bookCover, setBookCover] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');
  const [dateLabel, setDateLabel] = useState('');

  // Editable Timeline States
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDateType, setNewDateType] = useState<'none'|'start'|'finish'>('none');
  const [newDateValue, setNewDateValue] = useState('');

  // Progress Update States
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [myFormat, setMyFormat] = useState('Physical Book');
  const [myProgress, setMyProgress] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setCurrentUser(session.user);
    });
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: clubData } = await supabase.from('clubs').select('*').eq('id', id).single();
      if (clubData) {
        setClub(clubData);
        calculateTimeLogic(clubData);
        if (clubData.current_book_isbn) fetchBookData(clubData.current_book_isbn);
      }

      const { data: memberData } = await supabase.from('club_members').select('*').eq('club_id', id);
      if (memberData) {
        setMembers(memberData);
        // Pre-fill my progress if I'm already in the roster
        if (currentUser) {
          const myData = memberData.find(m => m.user_id === currentUser.id);
          if (myData) {
            setMyFormat(myData.reading_format || 'Physical Book');
            setMyProgress(myData.progress_percentage || 0);
          }
        }
      }
      setIsLoading(false);
    }
    if (id && currentUser !== undefined) fetchDashboardData();
  }, [id, currentUser]);

  function calculateTimeLogic(clubData: any) {
    const today = new Date().getTime();
    if (clubData.target_finish_date) {
      setDateLabel('Target Finish');
      const diffDays = Math.ceil((new Date(clubData.target_finish_date).getTime() - today) / (1000 * 60 * 60 * 24));
      setCountdown(diffDays > 0 ? `${diffDays} Days Remaining` : diffDays === 0 ? 'Deadline Today!' : `Ended`);
    } else if (clubData.start_date) {
      setDateLabel('Start Date');
      const diffDays = Math.ceil((new Date(clubData.start_date).getTime() - today) / (1000 * 60 * 60 * 24));
      setCountdown(diffDays > 0 ? `Starts in ${diffDays} Days` : diffDays === 0 ? 'Starts Today!' : `Started`);
    } else {
      setDateLabel('Timeline');
      setCountdown('Open Schedule');
    }
  }

  async function fetchBookData(isbn: string) {
    let titleSet = false;

    // 1. First Attempt: Your Internal Live Search Engine
    try {
      const res = await fetch(`/api/live-search?q=${encodeURIComponent(isbn)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.books && data.books.length > 0) {
          setBookTitle(data.books[0].title);
          if (data.books[0].cover_image_url && data.books[0].cover_image_url !== 'UNAVAILABLE') {
            setBookCover(data.books[0].cover_image_url.replace('http:', 'https:'));
          }
          titleSet = true;
        }
      }
    } catch (e) {
      console.warn("Internal API skipped. Moving to global networks.");
    }

    // 2. Second Attempt: Broad Google Books Fallback (Dropping the strict 'isbn:' prefix)
    if (!titleSet) {
      try {
        const gbRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${isbn}`);
        if (gbRes.ok) {
          const gbData = await gbRes.json();
          if (gbData.items && gbData.items.length > 0) {
            setBookTitle(gbData.items[0].volumeInfo.title);
            if (gbData.items[0].volumeInfo.imageLinks?.thumbnail) {
              setBookCover(gbData.items[0].volumeInfo.imageLinks.thumbnail.replace('http:', 'https:'));
            }
            titleSet = true;
          }
        }
      } catch (e) {
         console.warn("Google Books API failed.");
      }
    }
    
    // 3. The Final Net: OpenLibrary (The most reliable raw-ISBN resolver)
    if (!titleSet) {
      try {
        const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        if (olRes.ok) {
          const olData = await olRes.json();
          const bookData = olData[`ISBN:${isbn}`];
          if (bookData && bookData.title) {
            setBookTitle(bookData.title);
            if (bookData.cover?.medium) {
              setBookCover(bookData.cover.medium);
            }
            titleSet = true;
          }
        }
      } catch (e) {
         console.warn("OpenLibrary API failed.");
      }
    }

    // If all three global networks fail to find it
    if (!titleSet) {
      setBookTitle('Unknown Title (Check ISBN)');
    }
  }

  const handleUpdateTimeline = async () => {
    const payload: any = { start_date: null, target_finish_date: null };
    if (newDateType === 'start') payload.start_date = newDateValue;
    if (newDateType === 'finish') payload.target_finish_date = newDateValue;

    await supabase.from('clubs').update(payload).eq('id', id);
    setClub({ ...club, ...payload });
    calculateTimeLogic({ ...club, ...payload });
    setIsEditingDate(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    await supabase.from('club_members').update({ role: newRole }).eq('club_id', id).eq('user_id', userId);
    setMembers(members.map(m => m.user_id === userId ? { ...m, role: newRole } : m));
  };

  const removeMember = async (userId: string) => {
    if (!confirm("Remove this reader from the network?")) return;
    await supabase.from('club_members').delete().eq('club_id', id).eq('user_id', userId);
    setMembers(members.filter(m => m.user_id !== userId));
  };

  const handleSaveProgress = async () => {
    if (!currentUser) return;
    
    // UPSERT seamlessly updates existing members, or forces missing creators onto the roster
    await supabase.from('club_members').upsert({
      club_id: id,
      user_id: currentUser.id,
      role: currentUser.id === club.creator_id ? 'owner' : 'member',
      reading_format: myFormat,
      progress_percentage: myProgress
    }, { onConflict: 'club_id, user_id' });

    // Update local state instantly
    const existingMember = members.find(m => m.user_id === currentUser.id);
    if (existingMember) {
      setMembers(members.map(m => m.user_id === currentUser.id ? { ...m, reading_format: myFormat, progress_percentage: myProgress } : m));
    } else {
      setMembers([...members, { user_id: currentUser.id, role: 'owner', reading_format: myFormat, progress_percentage: myProgress }]);
    }
    setShowProgressModal(false);
  };

  if (isLoading || !club) return null; 

  const isOwner = currentUser?.id === club.creator_id;
  const isMod = isOwner || members.find(m => m.user_id === currentUser?.id)?.role === 'mod';

  const encodedTitle = encodeURIComponent(bookTitle);
  const waterstonesLink = `https://www.awin1.com/cread.php?awinmid=3787&awinaffid=2934999&p=${encodeURIComponent('https://www.waterstones.com/books/search/term/' + encodedTitle)}`;
  const amazonLink = `https://www.amazon.co.uk/s?k=${encodedTitle}&tag=bookhypermarket-21`;
  const bookshopLink = `https://www.awin1.com/cread.php?awinmid=62675&awinaffid=2934999&p=${encodeURIComponent('https://uk.bookshop.org/search?keywords=' + (club.current_book_isbn || encodedTitle))}`;

  const displayMembers = [...members];
  if (!displayMembers.find(m => m.user_id === club.creator_id)) {
    displayMembers.unshift({ user_id: club.creator_id, role: 'owner', isFaux: true, reading_format: 'Physical Book', progress_percentage: 0 });
  }

  return (
    <div className="relative mt-4">
      <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-lg mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Club Details</h2>
          <p className="text-gray-400 text-sm">Share this ID to invite others to your network.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invite ID:</span>
          <code className="bg-gray-900 text-blue-400 px-4 py-2 rounded border border-gray-700 text-sm font-mono shadow-inner">{club.id}</code>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 col-span-1 lg:col-span-2 backdrop-blur-sm relative flex flex-col items-center text-center">
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-full opacity-50"></div>
          
          <div className="w-full flex justify-between items-end border-b border-gray-700 pb-2 mb-8">
            <h2 className="text-xl font-bold text-white">Current Read</h2>
            <span className="text-sm text-sky-400 font-mono bg-sky-900/30 px-2 py-1 rounded">{countdown}</span>
          </div>

          {bookCover ? (
            <img src={bookCover} alt="Cover" className="w-32 md:w-48 h-auto rounded shadow-[0_0_20px_rgba(0,0,0,0.6)] border border-gray-600 object-cover mb-6" />
          ) : (
            <div className="w-32 md:w-48 h-48 md:h-72 bg-gray-900 rounded border border-gray-700 flex items-center justify-center mb-6">
              <span className="text-gray-600 font-bold text-xs uppercase text-center px-2">Cover Unavailable</span>
            </div>
          )}
          
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight max-w-md">{bookTitle}</h3>
          <p className="text-gray-400 text-sm font-mono bg-gray-900/50 px-4 py-1.5 rounded-full border border-gray-700 mb-8">ISBN: {club.current_book_isbn}</p>
          
          <div className="w-full max-w-md space-y-3 mb-8">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-left">Secure a Copy</p>
            <div className="grid grid-cols-3 gap-2">
              <a href={waterstonesLink} target="_blank" rel="noreferrer" className="bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-bold py-2 px-1 rounded transition-colors text-center border border-cyan-700">Waterstones</a>
              <a href={amazonLink} target="_blank" rel="noreferrer" className="bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold py-2 px-1 rounded transition-colors text-center border border-orange-600">Amazon</a>
              <a href={bookshopLink} target="_blank" rel="noreferrer" className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold py-2 px-1 rounded transition-colors text-center border border-teal-600">Bookshop</a>
            </div>
          </div>
          
          <div className="mt-auto w-full pt-4 border-t border-gray-700/50 flex flex-col items-center">
            {isEditingDate ? (
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-600 w-full max-w-md">
                <select value={newDateType} onChange={(e: any) => setNewDateType(e.target.value)} className="w-full bg-gray-800 text-white p-2 rounded mb-3 border border-gray-700 outline-none text-sm">
                  <option value="none">Flexible (No Date)</option>
                  <option value="start">Set Start Date</option>
                  <option value="finish">Set Finish Date</option>
                </select>
                {newDateType !== 'none' && (
                  <input type="date" value={newDateValue} onChange={(e) => setNewDateValue(e.target.value)} className="w-full bg-gray-800 text-white p-2 rounded mb-3 border border-gray-700 outline-none text-sm" />
                )}
                <div className="flex gap-2">
                  <button onClick={handleUpdateTimeline} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-sm transition">Save</button>
                  <button onClick={() => setIsEditingDate(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded text-sm transition">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">{dateLabel}:</strong> {club.target_finish_date || club.start_date ? new Date(club.target_finish_date || club.start_date).toLocaleDateString() : 'Flexible Timeline'}
                </p>
                {isOwner && (
                  <button onClick={() => setIsEditingDate(true)} className="text-xs text-blue-400 hover:text-blue-300 font-bold bg-blue-900/30 px-2 py-1 rounded">Edit</button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 col-span-1 backdrop-blur-sm flex flex-col">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Network Roster</h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {displayMembers.map((member, idx) => {
              const isThisUserOwner = member.user_id === club.creator_id || member.role === 'owner';
              const isMe = member.user_id === currentUser?.id;
              const formatIcon = member.reading_format === 'Audiobook' ? '🎧' : member.reading_format === 'E-Book' ? '📱' : '📖';
              
              return (
                <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col group">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-1">
                        {isMe ? 'You' : `Reader ${member.user_id.substring(0,5)}`}
                      </p>
                      <p className={`text-[10px] uppercase tracking-widest font-bold mt-0.5 ${isThisUserOwner ? 'text-yellow-500' : member.role === 'mod' ? 'text-blue-400' : 'text-gray-500'}`}>
                        {isThisUserOwner ? 'Owner' : member.role === 'mod' ? 'Moderator' : 'Member'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isMe && (
                        <button onClick={() => setShowProgressModal(true)} className="text-[10px] bg-blue-900/40 text-blue-400 hover:text-white px-2 py-1 rounded font-bold uppercase tracking-wide border border-blue-800/50 transition">
                          Update
                        </button>
                      )}
                      {isMod && !isThisUserOwner && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity relative dropdown-container">
                          <select 
                            onChange={(e) => {
                              if (e.target.value === 'kick') removeMember(member.user_id);
                              else if (e.target.value !== '') updateRole(member.user_id, e.target.value);
                              e.target.value = '';
                            }}
                            className="appearance-none bg-gray-800 text-gray-400 hover:text-white text-xs font-bold py-1 pl-2 pr-6 rounded border border-gray-600 outline-none cursor-pointer"
                          >
                            <option value="">⚙️ Manage</option>
                            {member.role === 'member' && <option value="mod">Promote to Mod</option>}
                            {member.role === 'mod' && <option value="member">Demote to Member</option>}
                            <option value="kick">Remove</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-1.5">
                    <span title={member.reading_format} className="flex items-center gap-1.5">
                      <span className="text-base">{formatIcon}</span> {member.reading_format}
                    </span>
                    <span>{member.progress_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 shadow-inner overflow-hidden border border-gray-700/50">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ width: `${member.progress_percentage || 0}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PROGRESS UPDATE MODAL */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Log Your Progress</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reading Format</label>
                <select value={myFormat} onChange={(e) => setMyFormat(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white outline-none">
                  <option value="Physical Book">📖 Physical Book</option>
                  <option value="E-Book">📱 E-Book</option>
                  <option value="Audiobook">🎧 Audiobook</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Percentage Complete: {myProgress}%</label>
                <input 
                  type="range" min="0" max="100" 
                  value={myProgress} onChange={(e) => setMyProgress(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => setShowProgressModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition">Cancel</button>
                <button onClick={handleSaveProgress} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}