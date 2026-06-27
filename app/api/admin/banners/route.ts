import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { secret, action, banner, id } = await request.json();

    if (!secret || (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY && secret !== process.env.ADMIN_SECRET)) {
      return NextResponse.json({ error: 'Unauthorized Vault Access' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (action === 'save') {
      if (banner.id) {
        // UPDATE EXISTING BANNER
        const { data, error } = await supabaseAdmin.from('storefront_banners').update(banner).eq('id', banner.id).select();
        if (error) throw error;
        return NextResponse.json({ success: true, banner: data[0] });
      } else {
        // FORGE NEW BANNER
        const { data, error } = await supabaseAdmin.from('storefront_banners').insert([banner]).select();
        if (error) throw error;
        return NextResponse.json({ success: true, banner: data[0] });
      }
    }

    if (action === 'delete') {
      const { error } = await supabaseAdmin.from('storefront_banners').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action provided.' }, { status: 400 });

  } catch (error: any) {
    console.error("[Banner API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}