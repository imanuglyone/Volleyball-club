import { NextResponse } from 'next/server';
import { authenticateTelegramRequest } from '@/lib/telegram/server-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { upsertTelegramProfile } from '@/lib/services/profiles';
import { miniAppError } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const profile = await upsertTelegramProfile(createSupabaseAdminClient(), authenticateTelegramRequest(request));
    return NextResponse.json({ profile });
  } catch (error) { return miniAppError(error); }
}
