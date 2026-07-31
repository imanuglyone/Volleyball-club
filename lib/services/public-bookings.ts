import type { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { createManagementToken, hmacSha256Hex, sha256Hex } from '@/lib/security';

export const MANAGEMENT_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type PublicBookingInput = {
  trainingId: string;
  name: string;
  phone: string;
  phoneNormalized: string;
  consentVersion: string;
  idempotencyKey: string;
};

export function canonicalPublicBookingHash(input: PublicBookingInput) {
  return sha256Hex(JSON.stringify({
    training_id: input.trainingId,
    name: input.name.trim(),
    phone: input.phoneNormalized,
    consent_version: input.consentVersion
  }));
}

export type PublicBookingReservationStatus =
  | 'owner'
  | 'pending'
  | 'replay'
  | 'rate_limited';

export type PublicBookingReservation = {
  status: PublicBookingReservationStatus;
  ownerToken: string | null;
  limitedBucket: 'ip' | 'phone_training' | null;
  retryAfter: number;
};

export async function checkPublicBookingIngressRateLimit(
  db: SupabaseClient,
  ip: string,
) {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET;
  if (!secret) throw new Error('rate_limit_not_configured');
  const { data, error } = await db.rpc('check_booking_ingress_rate_limit', {
    p_ip_hash: hmacSha256Hex(secret, `ingress-ip:${ip}`),
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return {
    allowed: result?.allowed === true,
    retryAfter: Number(result?.retry_after ?? 0),
  };
}

export async function reservePublicBookingRequest(
  db: SupabaseClient,
  input: PublicBookingInput,
  abuse: { ip: string },
): Promise<PublicBookingReservation> {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET;
  if (!secret) throw new Error('rate_limit_not_configured');
  const ownerToken = randomUUID();
  const { data, error } = await db.rpc('reserve_public_booking_request', {
    p_idempotency_key: input.idempotencyKey,
    p_request_hash: canonicalPublicBookingHash(input),
    p_owner_token: ownerToken,
    p_ip_hash: hmacSha256Hex(secret, `ip:${abuse.ip}`),
    p_phone_training_hash: hmacSha256Hex(
      secret,
      `phone-training:${input.phoneNormalized}:${input.trainingId}`,
    ),
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  const status = result?.reservation_status;
  if (
    status !== 'owner'
    && status !== 'pending'
    && status !== 'replay'
    && status !== 'rate_limited'
  ) {
    throw new Error('booking_reservation_invalid');
  }
  return {
    status,
    ownerToken: status === 'owner'
      ? String(result?.reservation_owner_token ?? ownerToken)
      : null,
    limitedBucket: result?.limited_bucket === 'ip'
      || result?.limited_bucket === 'phone_training'
      ? result.limited_bucket
      : null,
    retryAfter: Number(result?.retry_after ?? 0),
  };
}

export async function releasePublicBookingRequest(
  db: SupabaseClient,
  input: PublicBookingInput,
  ownerToken: string,
) {
  const { error } = await db.rpc('release_public_booking_request', {
    p_idempotency_key: input.idempotencyKey,
    p_request_hash: canonicalPublicBookingHash(input),
    p_owner_token: ownerToken,
  });
  if (error) throw error;
}

export async function createPublicBooking(
  db: SupabaseClient,
  input: PublicBookingInput,
  reservationOwnerToken: string | null,
) {
  const token = createManagementToken();
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + MANAGEMENT_TOKEN_TTL_MS).toISOString();
  const { data, error } = await db.rpc('create_public_booking', {
    p_training_id: input.trainingId,
    p_name: input.name.trim(),
    p_phone: input.phone,
    p_phone_normalized: input.phoneNormalized,
    p_consent_version: input.consentVersion,
    p_idempotency_key: input.idempotencyKey,
    p_request_hash: canonicalPublicBookingHash(input),
    p_reservation_owner_token: reservationOwnerToken,
    p_manage_token_hash: tokenHash,
    p_manage_token_expires_at: expiresAt
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.booking_id) throw new Error('booking_create_empty');
  return {
    bookingId: String(result.booking_id),
    remaining: Number(result.remaining),
    replayed: result.replayed === true,
    token
  };
}

export async function exchangeManagementToken(
  db: SupabaseClient,
  bookingId: string,
  presentedToken: string
) {
  const replacementToken = createManagementToken();
  const expiresAt = new Date(Date.now() + MANAGEMENT_TOKEN_TTL_MS).toISOString();
  const { data, error } = await db.rpc('exchange_public_booking_token', {
    p_booking_id: bookingId,
    p_token_hash: sha256Hex(presentedToken),
    p_replacement_hash: sha256Hex(replacementToken),
    p_replacement_expires_at: expiresAt
  });
  if (error) throw error;
  return data === true ? { replacementToken, expiresAt } : null;
}

export async function getManagedBooking(
  db: SupabaseClient,
  bookingId: string,
  token: string
) {
  const { data, error } = await db.rpc('get_public_booking_by_token', {
    p_booking_id: bookingId,
    p_token_hash: sha256Hex(token)
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] ?? null : data ?? null;
}

export async function cancelManagedBooking(
  db: SupabaseClient,
  bookingId: string,
  token: string
) {
  const { data, error } = await db.rpc('cancel_public_booking', {
    p_booking_id: bookingId,
    p_token_hash: sha256Hex(token)
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return result?.cancelled === true
    ? { trainingId: String(result.training_id) }
    : null;
}

export function managementCookieName(bookingId: string) {
  return `__Host-avangard-booking-${bookingId}`;
}
