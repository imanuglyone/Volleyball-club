import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDate, formatTimeRange, todayDateString } from '@/lib/format';

type TelegramUpdate = {
  message?: {
    chat?: { id?: number };
    text?: string;
  };
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(input: string | undefined) {
  if (!input) {
    return todayDateString();
  }
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('.');
    return `${year}-${month}-${day}`;
  }
  return null;
}

const defaultKeyboard = {
  keyboard: [
    [{ text: '/next' }, { text: '/dates' }],
    [{ text: '/tomorrow' }, { text: '/help' }]
  ],
  resize_keyboard: true
};

async function sendTelegramMessage(chatId: number, text: string, replyMarkup = defaultKeyboard) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return;
  }
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup })
  });
}

function buildHelp() {
  return [
    '\u041a\u043e\u043c\u0430\u043d\u0434\u044b:',
    '/next \u2014 \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0430\u044f \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0430 \u0441 \u0437\u0430\u043f\u0438\u0441\u044f\u043c\u0438',
    '/dates \u2014 \u043a\u043d\u043e\u043f\u043a\u0438 \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0438\u0445 \u0434\u0430\u0442',
    '/tomorrow \u2014 \u0441\u043f\u0438\u0441\u043e\u043a \u0437\u0430\u043f\u0438\u0441\u0430\u043d\u043d\u044b\u0445 \u043d\u0430 \u0437\u0430\u0432\u0442\u0440\u0430',
    '/list 2026-01-24 \u2014 \u0441\u043f\u0438\u0441\u043e\u043a \u043d\u0430 \u0434\u0430\u0442\u0443',
    '/stats 2026-01-24 \u2014 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u043f\u043e \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u043d\u043e\u0441\u0442\u0438',
    '/cancel +79990001122 \u2014 \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u044c \u043f\u043e \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0443',
    '/help \u2014 \u044d\u0442\u0430 \u0441\u043f\u0440\u0430\u0432\u043a\u0430',
    '\u041c\u043e\u0436\u043d\u043e \u043f\u0440\u043e\u0441\u0442\u043e \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0434\u0430\u0442\u0443: 2026-01-24 \u0438\u043b\u0438 24.01.2026',
    '\u0424\u043e\u0440\u043c\u0430\u0442 \u0434\u0430\u0442\u044b: YYYY-MM-DD \u0438\u043b\u0438 DD.MM.YYYY'
  ].join('\n');
}

async function buildListForDate(date: string) {
  const supabase = createSupabaseAdminClient();
  const { data: trainings } = await supabase
    .from('trainings_stats')
    .select('id, date, start_time, end_time, location_name, address, active_bookings, remaining')
    .eq('date', date)
    .order('start_time');

  if (!trainings || trainings.length === 0) {
    return `\u041d\u0430 ${formatDate(date)} \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442.`;
  }

  const trainingIds = trainings.map((item) => item.id);
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, training_id, name')
    .eq('status', 'active')
    .in('training_id', trainingIds)
    .order('created_at');

  const grouped = new Map<string, string[]>();
  (bookings ?? []).forEach((booking) => {
    if (!grouped.has(booking.training_id)) {
      grouped.set(booking.training_id, []);
    }
    grouped.get(booking.training_id)?.push(booking.name);
  });

  const lines: string[] = [`\u0417\u0430\u043f\u0438\u0441\u0438 \u043d\u0430 ${formatDate(date)}:`];

  trainings.forEach((training) => {
    lines.push('');
    lines.push(
      `\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0430 ${formatTimeRange(training.start_time, training.end_time)} (${training.active_bookings}/${training.remaining + training.active_bookings})`
    );
    if (training.location_name) {
      lines.push(`\u0417\u0430\u043b: ${training.location_name}`);
    }
    if (training.address) {
      lines.push(training.address);
    }

    const names = grouped.get(training.id) ?? [];
    if (names.length === 0) {
      lines.push('\u041d\u0435\u0442 \u0437\u0430\u043f\u0438\u0441\u0435\u0439.');
    } else {
      names.forEach((name, index) => {
        lines.push(`${index + 1}. ${name}`);
      });
    }
  });

  return lines.join('\n');
}

function normalizePhone(value: string) {
  return value.trim().replace(/[\s()-]/g, '');
}

async function buildNextTrainingList() {
  const supabase = createSupabaseAdminClient();
  const today = todayDateString();
  const { data: trainings } = await supabase
    .from('trainings_stats')
    .select('id, date, start_time, end_time, location_name, address, active_bookings, remaining')
    .gte('date', today)
    .eq('is_active', true)
    .order('date')
    .order('start_time')
    .limit(1);

  const training = trainings?.[0];
  if (!training) {
    return '\u0411\u043b\u0438\u0436\u0430\u0439\u0448\u0438\u0445 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442.';
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, name')
    .eq('training_id', training.id)
    .eq('status', 'active')
    .order('created_at');

  const lines: string[] = [
    `\u0417\u0430\u043f\u0438\u0441\u0438 \u043d\u0430 ${formatDate(training.date)}:`,
    `\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0430 ${formatTimeRange(training.start_time, training.end_time)} (${training.active_bookings}/${training.remaining + training.active_bookings})`
  ];

  if (training.location_name) {
    lines.push(`\u0417\u0430\u043b: ${training.location_name}`);
  }
  if (training.address) {
    lines.push(training.address);
  }

  if (!bookings || bookings.length === 0) {
    lines.push('\u041d\u0435\u0442 \u0437\u0430\u043f\u0438\u0441\u0435\u0439.');
  } else {
    bookings.forEach((booking, index) => {
      lines.push(`${index + 1}. ${booking.name}`);
    });
  }

  return lines.join('\n');
}

async function buildDatesKeyboard() {
  const supabase = createSupabaseAdminClient();
  const today = todayDateString();
  const { data: trainings } = await supabase
    .from('trainings_stats')
    .select('date')
    .gte('date', today)
    .eq('is_active', true)
    .order('date')
    .limit(12);

  const uniqueDates = Array.from(new Set((trainings ?? []).map((t) => t.date))).slice(0, 9);
  if (uniqueDates.length === 0) {
    return null;
  }

  const rows: { text: string }[][] = [];
  for (let i = 0; i < uniqueDates.length; i += 3) {
    const chunk = uniqueDates.slice(i, i + 3);
    rows.push(
      chunk.map((date) => ({
        text: formatDate(date)
      }))
    );
  }

  return { keyboard: rows, resize_keyboard: true };
}

async function cancelByPhone(phone: string) {
  const supabase = createSupabaseAdminClient();
  const normalized = normalizePhone(phone);
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, name, phone, trainings(date, start_time, end_time)')
    .eq('status', 'active')
    .eq('phone', normalized)
    .order('created_at');

  if (!bookings || bookings.length === 0) {
    return '\u041d\u0435\u0442 \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u0437\u0430\u043f\u0438\u0441\u0435\u0439 \u0434\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430.';
  }

  const bookingIds = bookings.map((b) => b.id);
  await supabase.from('bookings').update({ status: 'cancelled' }).in('id', bookingIds);

  const lines: string[] = ['\u041e\u0442\u043c\u0435\u043d\u0435\u043d\u044b \u0437\u0430\u043f\u0438\u0441\u0438:'];
  bookings.forEach((booking) => {
    const training = Array.isArray(booking.trainings) ? booking.trainings[0] : booking.trainings;
    if (training) {
      lines.push(
        `${formatDate(training.date)} ${formatTimeRange(training.start_time, training.end_time)}`
      );
    }
  });
  return lines.join('\n');
}

async function buildStatsForDate(date: string) {
  const supabase = createSupabaseAdminClient();
  const { data: trainings } = await supabase
    .from('trainings_stats')
    .select('date, start_time, end_time, capacity, active_bookings, remaining')
    .eq('date', date)
    .order('start_time');

  if (!trainings || trainings.length === 0) {
    return `\u041d\u0430 ${formatDate(date)} \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442.`;
  }

  const lines: string[] = [`\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u043d\u0430 ${formatDate(date)}:`];
  trainings.forEach((training) => {
    lines.push(
      `${formatTimeRange(training.start_time, training.end_time)} \u2014 \u0437\u0430\u043d\u044f\u0442\u043e ${training.active_bookings}, \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u043e ${training.remaining}, \u043b\u0438\u043c\u0438\u0442 ${training.capacity}`
    );
  });
  return lines.join('\n');
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get('x-telegram-bot-api-secret-token');
    if (header !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  const chatId = update?.message?.chat?.id;
  const text = update?.message?.text?.trim();

  if (!chatId || !text) {
    return NextResponse.json({ ok: true });
  }

  const [command, dateArg] = text.split(/\s+/);
  const dateOnly = parseDateInput(text);

  if (command === '/start') {
    await sendTelegramMessage(chatId, '\u0411\u043e\u0442 \u0434\u043b\u044f \u0437\u0430\u043f\u0438\u0441\u0435\u0439. \u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 \u043a\u043d\u043e\u043f\u043a\u0438 \u043d\u0438\u0436\u0435.', defaultKeyboard);
    return NextResponse.json({ ok: true });
  }

  if (command === '/next') {
    const text = await buildNextTrainingList();
    await sendTelegramMessage(chatId, text);
    return NextResponse.json({ ok: true });
  }

  if (command === '/tomorrow') {
    const date = addDays(new Date(), 1);
    const text = await buildListForDate(date);
    await sendTelegramMessage(chatId, text);
    return NextResponse.json({ ok: true });
  }

  if (command === '/dates') {
    const keyboard = await buildDatesKeyboard();
    await sendTelegramMessage(chatId, '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443:', keyboard ?? defaultKeyboard);
    return NextResponse.json({ ok: true });
  }

  if (command === '/help') {
    await sendTelegramMessage(chatId, buildHelp());
    return NextResponse.json({ ok: true });
  }

  if (!command.startsWith('/') && dateOnly) {
    const text = await buildListForDate(dateOnly);
    await sendTelegramMessage(chatId, text);
    return NextResponse.json({ ok: true });
  }

  if (command === '/cancel') {
    if (!dateArg) {
      await sendTelegramMessage(chatId, '\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0442\u0435\u043b\u0435\u0444\u043e\u043d. \u041f\u0440\u0438\u043c\u0435\u0440: /cancel +79990001122');
      return NextResponse.json({ ok: true });
    }
    const text = await cancelByPhone(dateArg);
    await sendTelegramMessage(chatId, text);
    return NextResponse.json({ ok: true });
  }

  if (command === '/list') {
    const date = parseDateInput(dateArg);
    if (!date) {
      await sendTelegramMessage(chatId, '\u041d\u0435\u0432\u0435\u0440\u043d\u0430\u044f \u0434\u0430\u0442\u0430. \u041f\u0440\u0438\u043c\u0435\u0440: 2026-01-24 \u0438\u043b\u0438 24.01.2026');
      return NextResponse.json({ ok: true });
    }
    const text = await buildListForDate(date);
    await sendTelegramMessage(chatId, text);
    return NextResponse.json({ ok: true });
  }

  if (command === '/stats') {
    const date = parseDateInput(dateArg);
    if (!date) {
      await sendTelegramMessage(chatId, '\u041d\u0435\u0432\u0435\u0440\u043d\u0430\u044f \u0434\u0430\u0442\u0430. \u041f\u0440\u0438\u043c\u0435\u0440: 2026-01-24 \u0438\u043b\u0438 24.01.2026');
      return NextResponse.json({ ok: true });
    }
    const text = await buildStatsForDate(date);
    await sendTelegramMessage(chatId, text);
    return NextResponse.json({ ok: true });
  }

  // Ignore any other free text to avoid noisy responses.
  return NextResponse.json({ ok: true });
}
