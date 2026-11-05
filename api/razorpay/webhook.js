// POST /api/razorpay/webhook
// Backup path: if a visitor closes the tab before /verify runs, Razorpay's
// payment.captured webhook still confirms the seat. Set the same URL and
// RAZORPAY_WEBHOOK_SECRET in the Razorpay dashboard.
import crypto from 'node:crypto';
import { adminDb } from '../_lib/admin.js';
import { confirmPayment, safeEqual } from './verify.js';

const readRaw = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (c) => { data += c; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'Webhook not configured' });

  const raw = await readRaw(req);
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (!safeEqual(expected, req.headers['x-razorpay-signature'] || '')) return res.status(400).json({ error: 'Bad signature' });

  try {
    const event = JSON.parse(raw);
    if (event.event === 'payment.captured') {
      const p = event.payload.payment.entity;
      const registrationId = p.notes?.registrationId;
      if (registrationId) await confirmPayment(adminDb(), registrationId, p.order_id, p.id);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error', err.message);
    // 200 so Razorpay does not retry forever on a registration we can't match
    return res.status(200).json({ ok: false });
  }
}
