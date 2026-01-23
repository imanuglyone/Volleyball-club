import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { bookingSchema, normalizePhone } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { formatDate, formatTimeRange } from '@/lib/format';
import { sendTelegramMessage } from '@/lib/telegram';

function parseError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null;
  }
  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return null;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const limit = rateLimit(ip, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }

  const { training_id, name, phone } = parsed.data;
  const normalizedPhone = normalizePhone(phone);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc('create_booking', {
    p_training_id: training_id,
    p_name: name.trim(),
    p_phone: normalizedPhone
  });

  if (error) {
    const message = parseError(error) ?? '';
    if (message.includes('booking_full')) {
      return NextResponse.json({ error: 'booking_full' }, { status: 409 });
    }
    if (message.includes('booking_duplicate')) {
      return NextResponse.json({ error: 'booking_duplicate' }, { status: 409 });
    }
    if (message.includes('training_inactive') || message.includes('training_past')) {
      return NextResponse.json({ error: 'training_inactive' }, { status: 409 });
    }

    console.error('Booking creation failed', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  const remaining = data?.[0]?.remaining ?? null;
  const { data: training } = await supabase
    .from('trainings')
    .select('date, start_time, end_time')
    .eq('id', training_id)
    .single();

  if (training) {
    const text = `\u041d\u043e\u0432\u0430\u044f \u0437\u0430\u043f\u0438\u0441\u044c \u2705\n\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0430: ${formatDate(training.date)} ${formatTimeRange(
      training.start_time,
      training.end_time
    )}\n\u0418\u043c\u044f: ${name.trim()}\n\u0422\u0435\u043b\u0435\u0444\u043e\u043d: ${normalizedPhone}\n\u041e\u0441\u0442\u0430\u043b\u043e\u0441\u044c \u043c\u0435\u0441\u0442: ${remaining ?? '\u2014'}`;
    await sendTelegramMessage(text);
  }

  return NextResponse.json({ ok: true, remaining });
}
