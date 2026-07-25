'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import DiscussionForm from './DiscussionForm';
import DiscussionThread from './DiscussionThread';
import { useParams } from 'next/navigation';

export default function DiscussionPage() {
  const params = useParams();
  const id = params?.id as string;

  const [reviews, setReviews] = useState<any[]>([]);
  const [bookData, setBookData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  const fetchAllData = async () => {
    // 1. Fetch the Club ISBN
    const { data: club } = await supabase.from('clubs').select('*').eq('id', id).single();

    if (club) {
      // 2. Fetch Book Metadata
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${club.current_book_isbn}`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setBookData(data.items[0].volumeInfo);
        }
      } catch (e) {
        console.error("Failed to fetch book data.");
      }
    }

    // 3. Fetch Reviews
    const { data: revs } = await supabase
      .from('chapter_reviews')
      .select('*')
      .eq('club_id', id)
      .order('created_at', { ascending: false });

    if (revs) setReviews(revs);
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) fetchAllData();
  }, [id]);

  // Safely grab the chapter number regardless of exact DB column name
  const getChapterNum = (r: any) => r.chapter_number || r.chapter;
  
  // Group into an array of unique chapters, sorted numerically
  const uniqueChapters = Array.from(new Set(reviews.map(getChapterNum))).sort((a, b) => a - b);

  if (isLoading) {
    return (
      <div className="text-center py-12 mt-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold">Loading Library...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-4xl mx-auto mt-4 relative">
      
      {/* The Popup Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <DiscussionForm
              clubId={id}
              onSuccess={() => {
                setIsModalOpen(false);
                fetchAllData(); // Instantly refreshes the data without sticking
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Book Metadata Header */}
      {bookData && (
        <div className="bg-gray-800/60 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-lg backdrop-blur-md mb-8 flex flex-col md:flex-row gap-6">
          {bookData.imageLinks?.thumbnail && (
            <img src={bookData.imageLinks.thumbnail} alt="Cover" className="w-32 md:w-40 rounded shadow-md object-cover" />
          )}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{bookData.title}</h2>
            <p className="text-gray-400 text-sm font-bold mb-4">
              {bookData.authors?.join(', ')} • {bookData.pageCount ? `${bookData.pageCount} Pages` : 'Unknown Length'}
            </p>
            {/* The Regex safely strips any HTML formatting out of the Google Books blurb */}
            <div className="text-gray-300 text-sm leading-relaxed max-h-32 overflow-y-auto pr-2">
              {bookData.description ? bookData.description.replace(/<[^>]+>/g, '') : 'No blurb available in the global network.'}
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-end border-b border-gray-700 pb-4 mb-6">
        <h2 className="text-xl font-bold text-white">Chapter Discussions</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition shadow-lg">
          + New Discussion
        </button>
      </div>

      {/* Audible-Style Chapter List */}
      <div className="space-y-3">
        {uniqueChapters.length === 0 ? (
          <div className="text-center py-12 text-gray-400 italic bg-gray-800/50 rounded-lg border border-gray-700 border-dashed backdrop-blur-sm">
            No discussions yet. Be the first to break the silence.
          </div>
        ) : (
          uniqueChapters.map((chapterNum) => (
            <div key={chapterNum as number} className="bg-gray-800/60 rounded-xl border border-gray-700 overflow-hidden backdrop-blur-sm transition-all">
              <button
                onClick={() => setExpandedChapter(expandedChapter === chapterNum ? null : (chapterNum as number))}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-bold text-lg text-white">Chapter {chapterNum as number}</span>
                <span className="text-gray-400 font-mono text-sm">
                  {reviews.filter(r => getChapterNum(r) === chapterNum).length} Thread(s) {expandedChapter === chapterNum ? '▲' : '▼'}
                </span>
              </button>

              {/* The Threads Hidden Inside */}
              {expandedChapter === chapterNum && (
                <div className="p-5 border-t border-gray-700 bg-gray-900/50 space-y-4">
                  {reviews.filter(r => getChapterNum(r) === chapterNum).map(review => (
                    <DiscussionThread key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}