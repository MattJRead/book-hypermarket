'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function DiscussionForm({ clubId }: { clubId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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
      console.error("🔥 SUPABASE REJECTION:", error);
      alert('Database blocked your submission. Check console for details.');
    } else {
      e.currentTarget.reset();
      router.refresh(); // Instantly displays the new post without reloading the page
    }
    setIsSubmitting(false);
  }

  return (
    <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-lg backdrop-blur-md">
      <h2 className="text-xl font-bold text-white mb-4">Start a Chapter Discussion</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Chapter</label>
          <input type="number" name="chapter" required min="1" className="w-32 bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Your Thoughts</label>
          <textarea name="thoughts" required rows={4} className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none"></textarea>
        </div>
        <button type="submit" disabled={isSubmitting} className={`bg-blue-600 text-white font-bold py-2 px-6 rounded-md transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}>
          {isSubmitting ? 'Posting...' : 'Post Discussion'}
        </button>
      </form>
    </div>
  );
}