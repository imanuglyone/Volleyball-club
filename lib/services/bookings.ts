import type { SupabaseClient } from '@supabase/supabase-js';

export function createProfileBookingV2(
  db: SupabaseClient,
  input: {
    trainingId: string;
    profileId: string;
    name: string;
    phone: string;
    consentVersion: string;
  }
) {
  return db.rpc('create_profile_booking_v2', {
    p_training_id: input.trainingId,
    p_profile_id: input.profileId,
    p_name: input.name,
    p_phone: input.phone,
    p_consent_version: input.consentVersion
  });
}

export function listProfileBookings(db: SupabaseClient, profileId: string) {
  return db.from('bookings').select('id, training_id, name, phone, status, created_at, profile_id, trainings(*)')
    .eq('profile_id', profileId).order('created_at', { ascending: false });
}

export function cancelProfileBooking(db: SupabaseClient, bookingId: string, profileId: string) {
  return db.rpc('cancel_profile_booking', { p_booking_id: bookingId, p_profile_id: profileId });
}
