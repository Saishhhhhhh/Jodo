export function getDeviceType(userAgent?: string): 'ios' | 'android' | 'desktop' | 'unknown' {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/windows|macintosh|linux/.test(ua)) return 'desktop';
  return 'unknown';
}

export function isMobileDevice(userAgent?: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return /iphone|ipad|ipod|android|mobile/.test(ua);
}

export function supportsAR(userAgent?: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) || /android/.test(ua);
}

export function getBrowserName(userAgent?: string): string {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/chrome/.test(ua) && !/edge|edg/.test(ua)) return 'chrome';
  if (/safari/.test(ua) && !/chrome/.test(ua)) return 'safari';
  if (/firefox/.test(ua)) return 'firefox';
  if (/edge|edg/.test(ua)) return 'edge';
  return 'unknown';
}
