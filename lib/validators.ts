import { z } from 'zod';

export const phoneRegex = /^[0-9+()\-\s]{8,20}$/;

export const bookingSchema = z.object({
  training_id: z.string().uuid(),
  name: z.string().trim().min(2).max(50),
  phone: z.string().trim().min(8).max(20).regex(phoneRegex)
});

export const trainingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}/),
  end_time: z.string().regex(/^\d{2}:\d{2}/),
  price: z.coerce.number().int().min(0),
  capacity: z.coerce.number().int().min(1),
  is_active: z.coerce.boolean().default(true)
});

export function normalizePhone(value: string) {
  return value.trim().replace(/[\s()\-]/g, '');
}