// Server-only helpers for the Vercel API routes. Nothing in /api is ever sent to
// the browser, so the Razorpay secret and the Firebase service account stay here.
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db = null;

export function adminDb() {
  if (db) return db;
  // Local testing against the Firestore emulator (never set in production).
  if (process.env.FIRESTORE_EMULATOR_HOST && process.env.GCLOUD_PROJECT) {
    if (!getApps().length) initializeApp({ projectId: process.env.GCLOUD_PROJECT });
    db = getFirestore();
    return db;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!raw) throw new HttpError(503, 'The server is not connected to Firebase yet.');
  const serviceAccount = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
  db = getFirestore();
  return db;
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function razorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new HttpError(503, 'Payments are not configured yet.');
  return { keyId, keySecret };
}

// Small call to the Razorpay REST API with basic auth (no SDK needed)
export async function razorpay(path, { method = 'GET', body } = {}) {
  const { keyId, keySecret } = razorpayKeys();
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError(502, data?.error?.description || 'Razorpay request failed.');
  return data;
}

// Wraps a handler: POST only, JSON body, consistent errors, no stack traces leaked
export function postHandler(fn) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const result = await fn(body, req);
      return res.status(200).json(result);
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      if (status === 500) console.error(err);
      return res.status(status).json({ error: status === 500 ? 'Something went wrong. Please try again.' : err.message });
    }
  };
}

export const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
