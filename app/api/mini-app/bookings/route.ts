import { NextResponse } from 'next/server';
import { authenticateTelegramRequest } from '@/lib/telegram/server-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { upsertTelegramProfile } from '@/lib/services/profiles';
import { createProfileBooking, listProfileBookings } from '@/lib/services/bookings';
import { miniAppBookingSchema, normalizePhone, profileSchema } from '@/lib/validators';
import { miniAppError } from '@/lib/api-error';

export async function GET(request: Request) {
  try {
    const db = createSupabaseAdminClient();
    const profile = await upsertTelegramProfile(db, authenticateTelegramRequest(request));
    const { data, error } = await listProfileBookings(db, profile.id);
    if (error) throw error;
    return NextResponse.json({ bookings: data ?? [] });
  } catch (error) { return miniAppError(error); }
}

export async function POST(request: Request) {
  try {
    const db = createSupabaseAdminClient();
    const profile = await upsertTelegramProfile(db, authenticateTelegramRequest(request));
    const body: unknown = await request.json().catch(() => null);
    const booking = miniAppBookingSchema.safeParse(body);
    if (!booking.success) return NextResponse.json({ error: 'validation' }, { status: 400 });
    const raw = body as Record<string, unknown>;
    const details = profileSchema.safeParse({ display_name: raw.display_name ?? profile.display_name, phone: raw.phone ?? profile.phone });
    if (!details.success) return NextResponse.json({ error: 'profile_required' }, { status: 400 });
    const { data, error } = await createProfileBooking(db, {
      trainingId: booking.data.training_id, profileId: profile.id,
      name: details.data.display_name, phone: normalizePhone(details.data.phone)
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, booking_id: data?.[0]?.booking_id, remaining: data?.[0]?.remaining });
  } catch (error) { return miniAppError(error); }
}
