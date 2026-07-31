import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getManagedBooking, managementCookieName } from '@/lib/services/public-bookings';
import { exchangeManagementRequest } from '@/lib/management-http';
import { privateJson, publicApiError } from '@/lib/public-api';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };

function validId(id: string) {
  return z.string().uuid().safeParse(id).success;
}

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params;
  if (!validId(id)) return privateJson({ error: 'not_found' }, { status: 404 });
  const token = request.cookies.get(managementCookieName(id))?.value;
  if (!token) return privateJson({ error: 'not_found' }, { status: 404 });
  try {
    const booking = await getManagedBooking(
      createSupabaseAdminClient(),
      id,
      token
    );
    if (!booking) return privateJson({ error: 'not_found' }, { status: 404 });
    return privateJson({ version: 1, booking });
  } catch (error) {
    return publicApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  const { id } = await params;
  if (!validId(id)) return privateJson({ error: 'not_found' }, { status: 404 });
  return exchangeManagementRequest(request, createSupabaseAdminClient(), id);
}
