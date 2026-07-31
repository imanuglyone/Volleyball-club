import { describe, expect, it } from 'vitest';
import { getPersonalRouteMode, getSurfaceFeatureFlags } from './feature-flags';

describe('getSurfaceFeatureFlags', () => {
  it('defaults every surface to legacy', () => {
    expect(getSurfaceFeatureFlags({})).toMatchObject({
      siteV2: false,
      miniAppV2: false,
      adminV2: false,
      invalid: false,
    });
  });

  it('enables V2 by default for released Vercel environments', () => {
    expect(getSurfaceFeatureFlags({ VERCEL_ENV: 'preview' })).toMatchObject({
      siteV2: true,
      miniAppV2: true,
      adminV2: true,
      invalid: false,
    });

    expect(getSurfaceFeatureFlags({ VERCEL_ENV: 'production' })).toMatchObject({
      siteV2: true,
      miniAppV2: true,
      adminV2: true,
      invalid: false,
    });
  });

  it('allows Preview defaults to be explicitly disabled', () => {
    expect(
      getSurfaceFeatureFlags({
        VERCEL_ENV: 'preview',
        MINI_APP_V2_ENABLED: 'false',
        SITE_V2_ENABLED: 'false',
        ADMIN_V2_ENABLED: 'false',
      }),
    ).toMatchObject({
      siteV2: false,
      miniAppV2: false,
      adminV2: false,
      invalid: false,
    });
  });

  it('only treats the exact string true as enabled', () => {
    expect(
      getSurfaceFeatureFlags({
        MINI_APP_V2_ENABLED: 'TRUE',
        SITE_V2_ENABLED: '1',
        ADMIN_V2_ENABLED: 'yes',
      }),
    ).toMatchObject({
      siteV2: false,
      miniAppV2: false,
      adminV2: false,
      invalid: false,
    });
  });

  it('fails the public site closed until the Mini App is enabled', () => {
    expect(
      getSurfaceFeatureFlags({
        SITE_V2_ENABLED: 'true',
      }),
    ).toMatchObject({
      siteV2: false,
      miniAppV2: false,
      adminV2: false,
      invalid: true,
    });
  });

  it('allows the Mini App to cut over while public routes remain legacy', () => {
    const flags = getSurfaceFeatureFlags({
      MINI_APP_V2_ENABLED: 'true',
    });

    expect(flags).toMatchObject({
      siteV2: false,
      miniAppV2: true,
      adminV2: false,
      invalid: false,
    });
    expect(flags.invalidReasons).toHaveLength(0);
  });

  it('allows all three surfaces only in dependency order', () => {
    expect(
      getSurfaceFeatureFlags({
        MINI_APP_V2_ENABLED: 'true',
        SITE_V2_ENABLED: 'true',
        ADMIN_V2_ENABLED: 'true',
      }),
    ).toMatchObject({
      siteV2: true,
      miniAppV2: true,
      adminV2: true,
      invalid: false,
    });
  });

  it('fails the admin closed without both dependencies', () => {
    const flags = getSurfaceFeatureFlags({
      SITE_V2_ENABLED: 'true',
      ADMIN_V2_ENABLED: 'true',
    });

    expect(flags).toMatchObject({
      siteV2: false,
      miniAppV2: false,
      adminV2: false,
      invalid: true,
    });
    expect(flags.invalidReasons).toContain(
      'SITE_V2_ENABLED requires MINI_APP_V2_ENABLED',
    );
  });

  it.each([
    [{}, 'legacy'],
    [{ MINI_APP_V2_ENABLED: 'true' }, 'redirect-to-app'],
    [{ SITE_V2_ENABLED: 'true' }, 'legacy'],
    [
      { MINI_APP_V2_ENABLED: 'true', SITE_V2_ENABLED: 'true' },
      'redirect-to-app',
    ],
  ] as const)(
    'keeps the exact personal-route matrix for %o',
    (environment, expected) => {
      expect(getPersonalRouteMode(environment)).toBe(expected);
    },
  );
});
