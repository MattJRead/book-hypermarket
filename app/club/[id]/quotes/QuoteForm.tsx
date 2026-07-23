'use client';

import { useState } from 'react';
import { addQuote } from '../../../actions/quoteActions';

export default function QuoteForm({ clubId }: { clubId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6 shadow-xl border border-gray-700 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Pin a Quote</h2>
      
      <form 
        id="quote-form"
        action={async (formData) => {
          setIsSubmitting(true);
          await addQuote(formData);
          setIsSubmitting(false);
          (document.getElementById('quote-form') as HTMLFormElement).reset();
        }} 
        className="space-y-4"
      >
        <input type="hidden" name="clubId" value={clubId} />

        <div className="flex gap-4">
          <div className="flex-none w-32">
            <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Chapter</label>
            <input type="number" name="chapter" min="1" required className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Who said it? (Optional)</label>
            <input type="text" name="attribution" placeholder="e.g. Gandalf" className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 uppercase font-bold mb-1">The Quote</label>
          <textarea 
            name="quoteText" 
            required 
            rows={3}
            placeholder="Type the exact quote here..." 
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 outline-none resize-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 px-6 rounded-md transition disabled:opacity-50"
        >
          {isSubmitting ? 'Pinning...' : 'Pin to Board'}
        </button>
      </form>
    </div>
  );
}