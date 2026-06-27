import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();

    // 1. The Gatekeeper Check
    if (!secret || (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY && secret !== process.env.ADMIN_SECRET)) {
      return NextResponse.json({ error: 'Unauthorized Vault Access' }, { status: 401 });
    }

    // 2. The Master Key Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Fetch Analytics bypass RLS
    const { data, error } = await supabaseAdmin
      .from('analytics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, analytics: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}