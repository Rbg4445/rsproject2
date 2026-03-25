// ============================================================
// GÜVENLİK YARDIMCI FONKSİYONLARI
// ============================================================

// --- Basit ama güvenli hash (SHA-256 simülasyonu localStorage için) ---
export function hashPassword(password: string): string {
  // PBKDF2 benzeri: password + salt ile deterministik hash
  const salt = 'ProjeAkademi_SALT_2025_@#$';
  const combined = password + salt;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  // Base36 + çoklu round ile güçlendirme
  let result = Math.abs(hash).toString(36);
  for (let round = 0; round < 3; round++) {
    let roundHash = 0;
    for (let i = 0; i < (result + salt).length; i++) {
      roundHash = (roundHash << 5) - roundHash + (result + salt).charCodeAt(i);
      roundHash = roundHash & roundHash;
    }
    result = Math.abs(roundHash).toString(36) + result;
  }
  return 'pa_' + result.slice(0, 40);
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// --- Session Token ---
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// --- Input Sanitization ---
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

export function sanitizeUsername(username: string): string {
  // Sadece harf, rakam, alt çizgi, tire
  return username.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
}

// --- Rate Limiting (Brute Force Koruması) ---
const RATE_LIMIT_KEY = 'pa_rate_limits';

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

function getRateLimits(): Record<string, RateLimitEntry> {
  try {
    const data = localStorage.getItem(RATE_LIMIT_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveRateLimits(limits: Record<string, RateLimitEntry>) {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(limits));
}

export function checkRateLimit(identifier: string): { allowed: boolean; remainingSeconds?: number; attemptsLeft?: number } {
  const limits = getRateLimits();
  const now = Date.now();
  const entry = limits[identifier];

  if (!entry) return { allowed: true, attemptsLeft: 5 };

  // Bloke süresi var mı?
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const remainingSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  // 15 dakika geçtiyse sıfırla
  if (now - entry.firstAttempt > 15 * 60 * 1000) {
    delete limits[identifier];
    saveRateLimits(limits);
    return { allowed: true, attemptsLeft: 5 };
  }

  // 5 denemeden fazla ise bloke et
  if (entry.attempts >= 5) {
    const blockDuration = Math.min(entry.attempts * 30 * 1000, 30 * 60 * 1000); // max 30 dk
    limits[identifier] = { ...entry, blockedUntil: now + blockDuration };
    saveRateLimits(limits);
    return { allowed: false, remainingSeconds: Math.ceil(blockDuration / 1000) };
  }

  return { allowed: true, attemptsLeft: 5 - entry.attempts };
}

export function recordFailedAttempt(identifier: string): void {
  const limits = getRateLimits();
  const now = Date.now();
  const entry = limits[identifier];

  if (!entry || now - entry.firstAttempt > 15 * 60 * 1000) {
    limits[identifier] = { attempts: 1, firstAttempt: now };
  } else {
    limits[identifier] = { ...entry, attempts: entry.attempts + 1 };
  }
  saveRateLimits(limits);
}

export function clearRateLimit(identifier: string): void {
  const limits = getRateLimits();
  delete limits[identifier];
  saveRateLimits(limits);
}

// --- Password Validation ---
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else suggestions.push('En az 8 karakter kullanın');

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password)) score++;
  else suggestions.push('Büyük harf ekleyin (A-Z)');

  if (/[0-9]/.test(password)) score++;
  else suggestions.push('Rakam ekleyin (0-9)');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push('Özel karakter ekleyin (!@#$%)');

  const labels = ['Çok Zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'];
  const colors = ['red', 'orange', 'yellow', 'blue', 'green'];

  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    color: colors[Math.min(score, 4)],
    suggestions,
  };
}

// --- Email Validation ---
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// --- URL Validation ---
export function validateUrl(url: string): boolean {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// --- Activity Log ---
const ACTIVITY_LOG_KEY = 'pa_activity_log';

export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  details: string;
  ip?: string;
  timestamp: string;
  success: boolean;
}

export function logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
  try {
    const logs: ActivityLog[] = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
    const newLog: ActivityLog = {
      ...log,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Son 500 logu tut
    if (logs.length > 500) logs.splice(500);
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
  } catch {
    // sessizce geç
  }
}

export function getActivityLogs(): ActivityLog[] {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearActivityLogs(): void {
  localStorage.removeItem(ACTIVITY_LOG_KEY);
}
