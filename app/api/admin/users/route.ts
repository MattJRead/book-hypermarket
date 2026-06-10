import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();

    // Verify the Admin Password
    if (secret !== process.env.ADMIN_BROADCAST_SECRET) {
      return NextResponse.json({ error: 'Unauthorized command code.' }, { status: 401 });
    }

    // Initialize Supabase with the Master Key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all registered users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error || !users) {
      return NextResponse.json({ error: 'Failed to retrieve user registry.' }, { status: 500 });
    }

    // Map the necessary data
    const userList = users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at
    }));

    return NextResponse.json({ success: true, users: userList });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server failure.' }, { status: 500 });
  }
}