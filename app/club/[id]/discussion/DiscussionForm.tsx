'use client';

import { useState } from 'react';
import { addReview } from '../../../actions/reviewActions';

export default function DiscussionForm({ clubId }: { clubId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6 shadow-xl border border-gray-700 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Start a Chapter Discussion</h2>
      
      <form 
        id="review-form"
        action={async (formData) => {
          setIsSubmitting(true);
          await addReview(formData);
          setIsSubmitting(false);
          (document.getElementById('review-form') as HTMLFormElement).reset();
        }} 
        className="space-y-4"
      >
        <input type="hidden" name="clubId" value={clubId} />

        <div className="w-32">
          <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Chapter</label>
          <input 
            type="number" 
            name="chapter" 
            min="1" 
            required 
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 outline-none" 
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Your Thoughts</label>
          <textarea 
            name="reviewText" 
            required 
            rows={4}
            placeholder="What did you think of this chapter? (Spoilers are safe here)" 
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 outline-none resize-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-md transition disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post Discussion'}
        </button>
      </form>
    </div>
  );
}