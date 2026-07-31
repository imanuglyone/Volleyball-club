import { recordOperationalEvent } from '@/lib/observability';

let lastRecordedFlagCode: string | undefined;

export type SurfaceFeatureFlags = {
  siteV2: boolean;
  miniAppV2: boolean;
  adminV2: boolean;
  requested: {
    siteV2: boolean;
    miniAppV2: boolean;
    adminV2: boolean;
  };
  invalid: boolean;
  invalidReasons: readonly string[];
};

function isFeatureEnabled(
  value: string | undefined,
  defaultEnabled: boolean,
): boolean {
  return value === undefined ? defaultEnabled : value === 'true';
}

/**
 * Parses surface flags as a dependency graph and fails closed for invalid
 * combinations. Vercel Preview enables V2 by default; every other environment
 * stays legacy unless explicitly enabled. An explicit value always wins.
 */
export function getSurfaceFeatureFlags(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): SurfaceFeatureFlags {
  const previewDefault = environment.VERCEL_ENV === 'preview';
  const requestedMiniAppV2 = isFeatureEnabled(
    environment.MINI_APP_V2_ENABLED,
    previewDefault,
  );
  const requestedSiteV2 = isFeatureEnabled(
    environment.SITE_V2_ENABLED,
    previewDefault,
  );
  const requestedAdminV2 = isFeatureEnabled(
    environment.ADMIN_V2_ENABLED,
    previewDefault,
  );
  const invalidReasons: string[] = [];

  if (requestedSiteV2 && !requestedMiniAppV2) {
    invalidReasons.push('SITE_V2_ENABLED requires MINI_APP_V2_ENABLED');
  }

  if (requestedAdminV2 && (!requestedSiteV2 || !requestedMiniAppV2)) {
    invalidReasons.push(
      'ADMIN_V2_ENABLED requires both SITE_V2_ENABLED and MINI_APP_V2_ENABLED',
    );
  }

  const miniAppV2 = requestedMiniAppV2;
  const siteV2 = requestedSiteV2 && miniAppV2;
  const adminV2 = requestedAdminV2 && siteV2 && miniAppV2;

  const flags = {
    siteV2,
    miniAppV2,
    adminV2,
    requested: {
      siteV2: requestedSiteV2,
      miniAppV2: requestedMiniAppV2,
      adminV2: requestedAdminV2,
    },
    invalid: invalidReasons.length > 0,
    invalidReasons,
  };

  if (environment === process.env) {
    const code = flags.invalid
      ? 'invalid_dependency'
      : `site_${Number(flags.siteV2)}_mini_${Number(flags.miniAppV2)}_admin_${Number(flags.adminV2)}`;
    if (code === lastRecordedFlagCode) return flags;
    lastRecordedFlagCode = code;
    recordOperationalEvent('feature_flag_evaluation', {
      surface: 'system',
      outcome: flags.invalid ? 'blocked' : 'success',
      code,
    });
  }

  return flags;
}

export function getPersonalRouteMode(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): 'legacy' | 'redirect-to-app' {
  return getSurfaceFeatureFlags(environment).miniAppV2
    ? 'redirect-to-app'
    : 'legacy';
}
