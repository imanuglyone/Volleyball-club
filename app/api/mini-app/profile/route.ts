import { NextResponse } from 'next/server';
import { authenticateTelegramRequest } from '@/lib/telegram/server-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { upsertTelegramProfile } from '@/lib/services/profiles';
import { profileSchema, normalizePhone } from '@/lib/validators';
import { miniAppError } from '@/lib/api-error';

export async function GET(request: Request) {
  try { return NextResponse.json({ profile: await upsertTelegramProfile(createSupabaseAdminClient(), authenticateTelegramRequest(request)) }); }
  catch (error) { return miniAppError(error); }
}

export async function PATCH(request: Request) {
  try {
    const db = createSupabaseAdminClient();
    const profile = await upsertTelegramProfile(db, authenticateTelegramRequest(request));
    const parsed = profileSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'validation' }, { status: 400 });
    const { data, error } = await db.from('profiles').update({
      display_name: parsed.data.display_name, phone: normalizePhone(parsed.data.phone), updated_at: new Date().toISOString()
    }).eq('id', profile.id).select('*').single();
    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error) { return miniAppError(error); }
}
