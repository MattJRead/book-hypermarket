export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';

export default async function AnalyticsDashboard() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all analytics data, ordered by newest first
  const { data: events, error } = await supabaseAdmin
    .from('analytics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <div className="p-8 text-red-500">Failed to load analytics: {error.message}</div>;

  const visits = events?.filter(e => e.event_type === 'page_visit') || [];
  const clicks = events?.filter(e => e.event_type === 'affiliate_click') || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-sky-400">Intelligence Command</h1>
        
        {/* TOP LEVEL METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-sm">Total Page Visits</h3>
            <p className="text-5xl font-black text-emerald-400">{visits.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-sm">Total Affiliate Clicks</h3>
            <p className="text-5xl font-black text-purple-400">{clicks.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-sm">Conversion Ratio</h3>
            <p className="text-5xl font-black text-yellow-400">
              {visits.length > 0 ? Math.round((clicks.length / visits.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* RECENT CLICK FEED */}
        <h2 className="text-2xl font-bold mb-4 border-b border-gray-800 pb-2">Recent Affiliate Clicks</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-gray-300 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Book Title</th>
                <th className="px-6 py-4">Target Store</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {clicks.slice(0, 15).map((click) => (
                <tr key={click.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(click.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-sky-300">
                    {click.details?.book_title || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-800 border border-gray-700 px-3 py-1 rounded text-xs font-mono text-gray-300 capitalize">
                      {click.details?.shop || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
              {clicks.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-mono">No clicks recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}