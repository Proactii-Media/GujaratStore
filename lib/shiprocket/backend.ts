/* eslint-disable @typescript-eslint/no-explicit-any */
// Uses global `fetch` provided by Node/Next.js runtime

const API_BASE = process.env.SHIPROCKET_API_BASE_URL || 'https://apiv2.shiprocket.in';
const EMAIL = process.env.SHIPROCKET_EMAIL;
const PASSWORD = process.env.SHIPROCKET_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.warn('[Shiprocket Backend] SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not configured');
}

let cachedToken: { token: string; expiry: number } | null = null;

async function login(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiry - 60 * 1000) {
    return cachedToken.token;
  }

  if (!EMAIL || !PASSWORD) throw new Error('Shiprocket credentials are not configured');

  const res = await fetch(`${API_BASE}/v1/external/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) {
    throw new Error((data && (data.message || data.error)) || `Auth failed: ${res.status}`);
  }

  // Shiprocket tokens are short-lived; cache for 50 minutes by default
  const token = data.token;
  const expiry = Date.now() + (50 * 60 * 1000);
  cachedToken = { token, expiry };
  return token;
}

export async function shiprocketRequest(path: string, init: RequestInit = {}) {
  const token = await login();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers || {}) } as any;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      throw new Error((json && (json.message || json.error)) || `Request failed: ${res.status}`);
    } 
    return json;
  } catch (e) {
    // If not JSON, throw raw text error for debugging
    if (!res.ok) throw new Error(text || `Request failed: ${res.status}`);
    return text;
  }
}

export async function invalidateToken() {
  cachedToken = null;
}

export default {
  login,
  shiprocketRequest,
  invalidateToken,
};
