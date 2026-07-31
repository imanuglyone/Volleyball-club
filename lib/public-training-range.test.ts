import { describe, expect, it } from 'vitest';
import {
  isValidClubDate,
  MAX_PUBLIC_TRAINING_RANGE_DAYS,
  normalizePublicTrainingRange,
} from './public-training-range';
import { addClubDays, clubDateString } from './club-time';

describe('public training range', () => {
  it('rejects impossible calendar dates', () => {
    expect(isValidClubDate('2026-02-29')).toBe(false);
    expect(isValidClubDate('2026-13-01')).toBe(false);
    expect(isValidClubDate('2026-12-01')).toBe(true);
    expect(isValidClubDate('9999-12-31')).toBe(false);
  });

  it('clamps broad and past ranges at the server boundary', () => {
    const today = clubDateString();
    const result = normalizePublicTrainingRange(
      '2000-01-01',
      '2099-12-31',
    );
    expect(result.from).toBe(today);
    expect(result.to).toBe(addClubDays(today, MAX_PUBLIC_TRAINING_RANGE_DAYS));
  });

  it('never generates an extended year near the upper bound', () => {
    expect(normalizePublicTrainingRange('2099-12-31', null)).toEqual({
      from: '2099-12-31',
      to: '2099-12-31',
    });
  });
});
