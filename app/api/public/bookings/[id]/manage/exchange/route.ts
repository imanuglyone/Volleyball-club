import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { exchangeManagementRequest } from '@/lib/management-http';
import { privateJson } from '@/lib/public-api';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return privateJson({ error: 'not_found' }, { status: 404 });
  }
  return exchangeManagementRequest(request, createSupabaseAdminClient(), id);
}
