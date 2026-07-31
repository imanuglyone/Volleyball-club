import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { safeStringEqual } from '@/lib/security';
import { privateJson } from '@/lib/public-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const presented = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!secret || !presented || !safeStringEqual(secret, presented)) {
    return privateJson({ error: 'unauthorized' }, { status: 401 });
  }
  const { data, error } = await createSupabaseAdminClient().rpc('run_privacy_retention');
  if (error) {
    console.error('Privacy retention failed', {
      kind: error instanceof Error ? error.name : 'database'
    });
    return privateJson({ error: 'server_error' }, { status: 500 });
  }
  const result = Array.isArray(data) ? data[0] ?? {} : data ?? {};
  return privateJson({ ok: true, result });
}

