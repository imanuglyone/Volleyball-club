import { z } from 'zod';

export const phoneRegex = /^[0-9+()\-\s]{8,20}$/;

export const bookingSchema = z.object({
  training_id: z.string().uuid(),
  name: z.string().trim().min(2).max(50),
  phone: z.string().trim().min(8).max(20).regex(phoneRegex)
});

export const publicBookingSchema = z.object({
  version: z.literal(1),
  training_id: z.string().uuid(),
  name: z.string().trim().min(2).max(50),
  phone: z.string().trim().min(8).max(20).regex(phoneRegex),
  consent: z.literal(true),
  consent_version: z.string().trim().min(1).max(64),
  idempotency_key: z.string().uuid(),
  turnstile_token: z.string().min(1).max(4096),
  website: z.string().max(200).default('')
});

export const managementExchangeSchema = z.object({
  token: z.string().min(40).max(100)
});

export const trainingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}/),
  end_time: z.string().regex(/^\d{2}:\d{2}/),
  price: z.coerce.number().int().min(0),
  capacity: z.coerce.number().int().min(1),
  location_name: z.string().trim().min(2).max(120).optional().or(z.literal('')),
  address: z.string().trim().min(2).max(200).optional().or(z.literal('')),
  is_active: z.coerce.boolean().default(true)
});

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith('7')) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return value.trim().replace(/[\s()\-]/g, '');
}

export const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(50),
  phone: z.string().trim().min(8).max(20).regex(phoneRegex)
});
export const miniAppBookingSchema = z.object({
  training_id: z.string().uuid(),
  consent: z.literal(true),
  consent_version: z.string().trim().min(1).max(64)
});
export const cancelBookingSchema = z.object({ booking_id: z.string().uuid() });
