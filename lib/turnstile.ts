type TurnstileResponse = { success?: boolean };

export async function verifyTurnstile(token: string, ip?: string) {
  const isProduction = process.env.VERCEL_ENV === 'production'
    || process.env.NODE_ENV === 'production';
  const mockAllowed = !isProduction && process.env.ALLOW_TURNSTILE_MOCK === 'true';
  if (mockAllowed && token === process.env.TURNSTILE_MOCK_TOKEN) return true;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'unknown') body.set('remoteip', ip);
  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body, cache: 'no-store', signal: AbortSignal.timeout(5_000) }
    );
    if (!response.ok) return false;
    const result = await response.json() as TurnstileResponse;
    return result.success === true;
  } catch {
    return false;
  }
}

