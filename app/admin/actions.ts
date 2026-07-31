'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { trainingSchema } from '@/lib/validators';
import { formatDate, formatTimeRange } from '@/lib/format';
import { sendTelegramMessage } from '@/lib/telegram';
import { invalidateTrainingCache } from '@/lib/cache-tags';

function parseTrainingForm(formData: FormData) {
  const raw = {
    date: formData.get('date'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    price: formData.get('price'),
    capacity: formData.get('capacity'),
    location_name: formData.get('location_name'),
    address: formData.get('address'),
    is_active: formData.get('is_active') === 'on'
  };

  return trainingSchema.safeParse(raw);
}

export async function createTraining(formData: FormData) {
  await requireAdminSession();
  const parsed = parseTrainingForm(formData);
  if (!parsed.success) {
    throw new Error('Validation failed');
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('trainings')
    .insert(parsed.data)
    .select('id')
    .single();
  if (error || !data) {
    console.error('Create training failed', { code: error?.code ?? 'empty' });
    throw new Error('Create training failed');
  }

  invalidateTrainingCache(data.id);
  revalidatePath('/admin');
}

export async function updateTraining(id: string, formData: FormData) {
  await requireAdminSession();
  const parsed = parseTrainingForm(formData);
  if (!parsed.success) {
    throw new Error('Validation failed');
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('trainings').update(parsed.data).eq('id', id);
  if (error) {
    console.error('Update training failed', { code: error.code });
    throw new Error('Update training failed');
  }

  invalidateTrainingCache(id);
  revalidatePath('/admin');
  revalidatePath(`/admin/trainings/${id}/edit`);
}

export async function deleteTraining(id: string) {
  await requireAdminSession();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('trainings').delete().eq('id', id);
  if (error) {
    console.error('Delete training failed', { code: error.code });
    throw new Error('Delete training failed');
  }

  invalidateTrainingCache(id);
  revalidatePath('/admin');
}

export async function toggleTrainingActive(id: string, nextState: boolean) {
  await requireAdminSession();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('trainings').update({ is_active: nextState }).eq('id', id);
  if (error) {
    console.error('Toggle training failed', { code: error.code });
    throw new Error('Toggle training failed');
  }

  invalidateTrainingCache(id);
  revalidatePath('/admin');
}

export async function cancelBooking(bookingId: string) {
  await requireAdminSession();
  const supabase = createSupabaseAdminClient();

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, training_id, name, phone, status, trainings:trainings(date, start_time, end_time)')
    .eq('id', bookingId)
    .single();

  if (!booking || booking.status === 'cancelled') {
    return;
  }

  const { data: cancelled, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      manage_token_hash: null,
      manage_token_expires_at: null,
      cancel_idempotency_hash: null,
      cancel_idempotency_expires_at: null,
    })
    .eq('id', bookingId)
    .eq('status', 'active')
    .select('id')
    .maybeSingle();
  if (error) {
    console.error('Cancel booking failed', { code: error.code });
    throw new Error('Cancel booking failed');
  }
  if (!cancelled) return;

  const training = Array.isArray(booking.trainings) ? booking.trainings[0] : booking.trainings;
  if (training) {
    const text = `\u0417\u0430\u043f\u0438\u0441\u044c \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u0430 \u274c\n\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0430: ${formatDate(training.date)} ${formatTimeRange(
      training.start_time,
      training.end_time
    )}\n\u0418\u043c\u044f: ${booking.name}\n\u0422\u0435\u043b\u0435\u0444\u043e\u043d: ${booking.phone}`;
    await sendTelegramMessage(text);
  }

  invalidateTrainingCache(booking.training_id);
  revalidatePath('/admin');
}

export async function anonymizeProfile(profileId: string) {
  await requireAdminSession();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc('anonymize_profile', {
    p_profile_id: profileId,
  });
  if (error) {
    console.error('Profile anonymization failed', { code: error.code });
    throw new Error(
      error.message.includes('profile_has_active_bookings')
        ? 'Profile has active bookings'
        : 'Profile anonymization failed',
    );
  }
  revalidatePath('/admin');
}
