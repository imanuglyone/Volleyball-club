import { authenticateTelegramRequest } from '@/lib/telegram/server-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { upsertTelegramProfile } from '@/lib/services/profiles';
import { profileSchema } from '@/lib/validators';
import { buildVerifiedProfilePatch } from '@/lib/services/profile-update';
import { miniAppError } from '@/lib/api-error';
import { privateJson } from '@/lib/public-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try { return privateJson({ profile: await upsertTelegramProfile(createSupabaseAdminClient(), authenticateTelegramRequest(request)) }); }
  catch (error) { return miniAppError(error); }
}

export async function PATCH(request: Request) {
  try {
    const db = createSupabaseAdminClient();
    const profile = await upsertTelegramProfile(db, authenticateTelegramRequest(request));
    const parsed = profileSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return privateJson({ error: 'validation' }, { status: 400 });
    const { data, error } = await db.from('profiles').update({
      ...buildVerifiedProfilePatch(profile, parsed.data),
      updated_at: new Date().toISOString()
    }).eq('id', profile.id).select('*').single();
    if (error) throw error;
    return privateJson({ profile: data });
  } catch (error) { return miniAppError(error); }
}
