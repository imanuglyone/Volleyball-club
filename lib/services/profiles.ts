import type { SupabaseClient } from '@supabase/supabase-js';
import type { TelegramUser } from '@/lib/telegram/types';
import type { Profile } from '@/lib/types';

export async function upsertTelegramProfile(db: SupabaseClient, user: TelegramUser): Promise<Profile> {
  const fallbackName = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const { data: existing } = await db.from('profiles').select('display_name').eq('telegram_user_id', user.id).maybeSingle();
  const { data, error } = await db.from('profiles').upsert({
    telegram_user_id: user.id,
    telegram_username: user.username ?? null,
    first_name: user.first_name,
    last_name: user.last_name ?? null,
    photo_url: user.photo_url ?? null,
    display_name: existing?.display_name ?? fallbackName,
    updated_at: new Date().toISOString()
  }, { onConflict: 'telegram_user_id' }).select('*').single();
  if (error) throw error;
  return data as Profile;
}
