import { NextResponse } from 'next/server';
import { authenticateTelegramRequest } from '@/lib/telegram/server-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { upsertTelegramProfile } from '@/lib/services/profiles';
import { cancelProfileBooking } from '@/lib/services/bookings';
import { cancelBookingSchema } from '@/lib/validators';
import { miniAppError } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const db = createSupabaseAdminClient();
    const profile = await upsertTelegramProfile(db, authenticateTelegramRequest(request));
    const parsed = cancelBookingSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'validation' }, { status: 400 });
    const { data, error } = await cancelProfileBooking(db, parsed.data.booking_id, profile.id);
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'booking_not_found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return miniAppError(error); }
}
