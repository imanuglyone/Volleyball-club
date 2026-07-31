import { privateJson } from '@/lib/public-api';
import { handlePublicBookingCreate } from '@/lib/public-booking-http';

export const dynamic = 'force-dynamic';

// Seven-day compatibility endpoint. It accepts the V2 protected request
// contract but preserves the legacy response fields.
export async function POST(request: Request) {
  const response = await handlePublicBookingCreate(request);
  if (!response.ok) return response;
  const body = await response.json() as {
    booking_id: string;
    remaining: number;
    manage_url: string;
  };
  return privateJson({
    ok: true,
    remaining: body.remaining,
    booking_id: body.booking_id,
    manage_url: body.manage_url
  }, { status: 200 });
}
