import { env } from '@/lib/env';

const LOCAL_SITE_URL = 'http://localhost:3000';

function sanitizeSiteUrl(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function getSiteUrl() {
  return (
    sanitizeSiteUrl(env.NEXT_PUBLIC_APP_URL) ??
    sanitizeSiteUrl(env.NEXT_PUBLIC_SITE_URL) ??
    LOCAL_SITE_URL
  );
}

export function getSiteUrlObject() {
  return new URL(getSiteUrl());
}
