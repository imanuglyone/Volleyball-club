import { describe, expect, it } from 'vitest';
import {
  addClubDays,
  clubDateString,
  clubLocalDateTimeKey,
  clubWeekday,
} from './club-time';

describe('Irkutsk club time', () => {
  it('crosses the local date boundary at UTC+8', () => {
    const instant = new Date('2026-07-30T16:30:00.000Z');
    expect(clubDateString(instant)).toBe('2026-07-31');
    expect(clubLocalDateTimeKey(instant)).toBe('2026-07-31T00:30:00');
  });

  it('adds calendar days independently of the host timezone', () => {
    expect(addClubDays('2026-07-31', 1)).toBe('2026-08-01');
    expect(addClubDays('2026-12-31', 45)).toBe('2027-02-14');
  });

  it('classifies a club date weekday independently of browser timezone', () => {
    expect(clubWeekday('2026-08-01')).toBe(6);
    expect(clubWeekday('2026-08-02')).toBe(0);
    expect(clubWeekday('2026-08-03')).toBe(1);
  });
});
