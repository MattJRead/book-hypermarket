import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, type, action_url, secret } = body;

    // 1. Verify the Master Password
    if (secret !== process.env.ADMIN_BROADCAST_SECRET) {
      return NextResponse.json({ error: 'ACCESS DENIED: Invalid Command Code' }, { status: 401 });
    }

    // 2. Initialize the Vault Key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Fire the Broadcast into the database
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert([{ title, message, type, action_url }]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Broadcast deployed successfully.' });

  } catch (error: any) {
    console.error('[CRITICAL BROADCAST FAILURE]:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}