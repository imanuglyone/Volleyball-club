import { addClubDays, clubDateString } from '@/lib/club-time';

export const MAX_PUBLIC_TRAINING_RANGE_DAYS = 90;
export const MAX_PUBLIC_TRAINING_DATE = '2099-12-31';
export const MIN_PUBLIC_TRAINING_DATE = '2000-01-01';

export function isValidClubDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  if (value < MIN_PUBLIC_TRAINING_DATE || value > MAX_PUBLIC_TRAINING_DATE) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function normalizePublicTrainingRange(
  fromValue?: string | null,
  toValue?: string | null,
) {
  const today = clubDateString();
  const from = isValidClubDate(fromValue) && fromValue > today
    ? fromValue
    : today;
  const maximumToCandidate = addClubDays(from, MAX_PUBLIC_TRAINING_RANGE_DAYS);
  const maximumTo = maximumToCandidate > MAX_PUBLIC_TRAINING_DATE
    ? MAX_PUBLIC_TRAINING_DATE
    : maximumToCandidate;
  const defaultToCandidate = addClubDays(from, 60);
  const defaultTo = defaultToCandidate > maximumTo ? maximumTo : defaultToCandidate;
  const to = isValidClubDate(toValue) && toValue >= from
    ? toValue > maximumTo ? maximumTo : toValue
    : defaultTo;
  return { from, to };
}
