const RECAPTCHA_SITE_KEY = '6LcrtJksAAAAAG7d2S2_plStwbDrABJjzH0RDnOL';
const RC_PREFIX = 'pa_recaptcha';

function key(scope: string) {
  return `${RC_PREFIX}_${scope}`;
}

function now() {
  return Date.now();
}

export function getRecaptchaSiteKey() {
  return RECAPTCHA_SITE_KEY;
}

export function getSuspiciousAttempts(scope: string): number {
  try {
    const raw = localStorage.getItem(key(scope));
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { attempts: number; firstAt: number; verifiedUntil?: number };
    if (now() - parsed.firstAt > 30 * 60 * 1000) {
      localStorage.removeItem(key(scope));
      return 0;
    }
    return parsed.attempts || 0;
  } catch {
    return 0;
  }
}

export function needsRecaptcha(scope: string): boolean {
  try {
    const raw = localStorage.getItem(key(scope));
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { attempts: number; firstAt: number; verifiedUntil?: number };
    if (now() - parsed.firstAt > 30 * 60 * 1000) {
      localStorage.removeItem(key(scope));
      return false;
    }
    if (parsed.verifiedUntil && parsed.verifiedUntil > now()) return false;
    return (parsed.attempts || 0) >= 2;
  } catch {
    return false;
  }
}

export function recordSuspiciousAttempt(scope: string): void {
  try {
    const raw = localStorage.getItem(key(scope));
    if (!raw) {
      localStorage.setItem(key(scope), JSON.stringify({ attempts: 1, firstAt: now() }));
      return;
    }
    const parsed = JSON.parse(raw) as { attempts: number; firstAt: number; verifiedUntil?: number };
    if (now() - parsed.firstAt > 30 * 60 * 1000) {
      localStorage.setItem(key(scope), JSON.stringify({ attempts: 1, firstAt: now() }));
      return;
    }
    localStorage.setItem(
      key(scope),
      JSON.stringify({
        attempts: (parsed.attempts || 0) + 1,
        firstAt: parsed.firstAt,
        verifiedUntil: parsed.verifiedUntil,
      })
    );
  } catch {
    // ignore
  }
}

export function markRecaptchaVerified(scope: string): void {
  try {
    const raw = localStorage.getItem(key(scope));
    const parsed = raw ? (JSON.parse(raw) as { attempts: number; firstAt: number; verifiedUntil?: number }) : { attempts: 0, firstAt: now() };
    localStorage.setItem(
      key(scope),
      JSON.stringify({
        attempts: parsed.attempts || 0,
        firstAt: parsed.firstAt || now(),
        verifiedUntil: now() + 15 * 60 * 1000,
      })
    );
  } catch {
    // ignore
  }
}

export function clearRecaptchaState(scope: string): void {
  try {
    localStorage.removeItem(key(scope));
  } catch {
    // ignore
  }
}
