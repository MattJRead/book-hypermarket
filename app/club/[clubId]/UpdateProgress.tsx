'use client';

import { useState } from 'react';
import { updateReadingProgress } from '../../actions/progressActions';

export default function UpdateProgress({ clubId }: { clubId: string }) {
  const [format, setFormat] = useState('Physical');
  const [isUpdating, setIsUpdating] = useState(false);

  // Dynamic label based on format
  const positionLabel = format === 'Audiobook' ? 'Current Chapter' : 'Current Page';
  const totalLabel = format === 'Audiobook' ? 'Total Chapters' : 'Total Pages';

  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6 shadow-xl border border-gray-700 mt-6">
      <h3 className="text-xl font-bold text-white mb-4">Log Your Progress</h3>
      
      <form 
        action={async (formData) => {
          setIsUpdating(true);
          await updateReadingProgress(formData);
          setIsUpdating(false);
        }} 
        className="flex flex-col md:flex-row gap-4 items-end"
      >
        {/* Hidden input to pass the club ID securely to the server */}
        <input type="hidden" name="clubId" value={clubId} />

        <div className="flex-1 w-full">
          <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Format</label>
          <select 
            name="format" 
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Physical">Physical Book</option>
            <option value="E-Book">E-Book</option>
            <option value="Audiobook">Audiobook</option>
          </select>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs text-gray-400 uppercase font-bold mb-1">{positionLabel}</label>
          <input 
            type="number" 
            name="position" 
            min="0"
            required
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs text-gray-400 uppercase font-bold mb-1">{totalLabel}</label>
          <input 
            type="number" 
            name="total" 
            min="1"
            required
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={isUpdating}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-md transition disabled:opacity-50"
        >
          {isUpdating ? 'Saving...' : 'Update'}
        </button>
      </form>
    </div>
  );
}