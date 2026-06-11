import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { title, message, type, action_url, secret } = await request.json();

    // 1. Verify the Admin Password (with whitespace armor and diagnostic wiretap)
    const providedSecret = secret || '';
    const expectedSecret = process.env.ADMIN_BROADCAST_SECRET || '';
    
    console.log(`[AUTH CHECK] Received: '${providedSecret}' | Expected: '${expectedSecret}'`);

    if (providedSecret.trim() !== expectedSecret.trim()) {
      return NextResponse.json({ error: 'Unauthorized command code.' }, { status: 401 });
    }

    // 2. Initialize Supabase with the Master Key (Bypassing RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Fetch all registered users
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError || !users) {
      return NextResponse.json({ error: 'Failed to retrieve user registry.' }, { status: 500 });
    }

    // 4. Construct the notification payload for every user
    const broadcastPayload = users.map(user => ({
      user_id: user.id,
      title,
      message,
      type: type || 'system_update',
      action_url: action_url || null,
      is_read: false
    }));

    // 5. Execute the Mass Insert
    const { error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert(broadcastPayload);

    if (insertError) {
      console.error('[DB ERROR]:', insertError);
      return NextResponse.json({ error: `Database blocked it: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Broadcast successfully deployed to ${users.length} users.` 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server failure.' }, { status: 500 });
  }
}