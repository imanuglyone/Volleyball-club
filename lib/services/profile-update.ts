import { normalizePhone } from '@/lib/validators';

export function buildVerifiedProfilePatch(
  current: { phone: string | null; phone_verified_at?: string | null },
  input: { display_name: string; phone: string },
) {
  const phone = normalizePhone(input.phone);
  const currentPhone = current.phone ? normalizePhone(current.phone) : null;
  return {
    display_name: input.display_name,
    phone,
    phone_verified_at:
      currentPhone === phone ? current.phone_verified_at ?? null : null,
  };
}
