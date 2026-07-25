'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

export default function DiscussionForm({ 
  clubId, 
  onSuccess, 
  onCancel 
}: { 
  clubId: string, 
  onSuccess: () => void, 
  onCancel: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return alert('You must be signed in to post.');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const chapter = parseInt(formData.get('chapter') as string);
    const thoughts = formData.get('thoughts') as string;

    const { error } = await supabase
      .from('chapter_reviews')
      .insert({
        club_id: clubId,
        user_id: user.id,
        chapter_number: chapter, 
        review_text: thoughts
      });

    if (error) {
      console.error(error);
      alert('Database blocked your submission.');
      setIsSubmitting(false);
    } else {
      e.currentTarget.reset();
      setIsSubmitting(false);
      onSuccess(); // Tells the parent page to fetch the new data and close the popup
    }
  }

  return (
    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-600 shadow-2xl relative">
      <button onClick={onCancel} type="button" className="absolute top-4 right-5 text-gray-400 hover:text-white font-bold text-xl">✕</button>
      
      <h2 className="text-xl font-bold text-white mb-6">Start a Chapter Discussion</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Chapter</label>
          <input type="number" name="chapter" required min="1" className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Your Thoughts</label>
          <textarea name="thoughts" required rows={5} className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none"></textarea>
        </div>
        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={isSubmitting} className={`flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-md transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}>
            {isSubmitting ? 'Posting...' : 'Post Discussion'}
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}