let cachedIp = '';

export async function getClientIp(): Promise<string> {
  if (cachedIp) return cachedIp;

  const endpoints = [
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json',
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = (await res.json()) as { ip?: string };
      if (data.ip) {
        cachedIp = data.ip;
        return cachedIp;
      }
    } catch {
      // try next endpoint
    }
  }

  return 'unknown';
}