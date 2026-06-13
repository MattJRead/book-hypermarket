import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, details } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from('analytics')
      .insert([{ event_type, details }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ANALYTICS FAILURE]:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}