// POST /api/razorpay/verify
// Confirms a payment after Razorpay checkout. The signature is checked with the
// secret key, the order must belong to this registration, and the payment is
// fetched from Razorpay to confirm the amount before the seat is confirmed.
import crypto from 'node:crypto';
import { adminDb, postHandler, HttpError, clean, razorpay, razorpayKeys } from '../_lib/admin.js';

export const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export async function confirmPayment(db, registrationId, orderId, paymentId) {
  const ref = db.collection('registrations').doc(registrationId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpError(404, 'Registration not found.');
    const reg = snap.data();
    if (reg.razorpayOrderId !== orderId) throw new HttpError(400, 'This payment does not match the registration.');
    if (reg.paid) return reg;
    const payment = await razorpay(`/payments/${paymentId}`);
    if (payment.order_id !== orderId) throw new HttpError(400, 'This payment does not match the order.');
    if (!['captured', 'authorized'].includes(payment.status)) throw new HttpError(402, 'The payment has not gone through.');
    if (payment.amount !== reg.razorpayOrderAmount) throw new HttpError(400, 'The amount paid does not match.');
    const update = {
      paid: true,
      status: 'confirmed',
      paidAt: new Date().toISOString(),
      payment: { paymentId, orderId, method: payment.method || '', amount: payment.amount },
    };
    tx.update(ref, update);
    return { ...reg, ...update };
  });
}

export default postHandler(async (body) => {
  const registrationId = clean(body.registrationId, 40);
  const orderId = clean(body.razorpay_order_id, 60);
  const paymentId = clean(body.razorpay_payment_id, 60);
  const signature = clean(body.razorpay_signature, 200);
  if (!registrationId || !orderId || !paymentId || !signature) throw new HttpError(400, 'Missing payment details.');

  const { keySecret } = razorpayKeys();
  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  if (!safeEqual(expected, signature)) throw new HttpError(400, 'Payment signature is not valid.');

  await confirmPayment(adminDb(), registrationId, orderId, paymentId);
  return { ok: true, paymentId, orderId };
});
