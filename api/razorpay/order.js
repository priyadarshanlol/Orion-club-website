// POST /api/razorpay/order
// Creates a Razorpay order for a registration that is waiting for payment.
// The amount comes from the registration the server created, never from the browser.
import { adminDb, postHandler, HttpError, clean, razorpay } from '../_lib/admin.js';

export default postHandler(async (body) => {
  const registrationId = clean(body.registrationId, 40);
  if (!registrationId) throw new HttpError(400, 'Missing registration.');

  const db = adminDb();
  const ref = db.collection('registrations').doc(registrationId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpError(404, 'Registration not found.');
  const reg = snap.data();
  if (reg.paid || reg.status !== 'pending_payment') throw new HttpError(409, 'This registration does not need a payment.');

  const amount = Math.round(Number(reg.amount) * 100); // paise
  if (!(amount >= 100)) throw new HttpError(409, 'This registration has no payable amount.');

  // Reuse an unpaid order for the same amount instead of creating duplicates
  if (reg.razorpayOrderId && reg.razorpayOrderAmount === amount) {
    const existing = await razorpay(`/orders/${reg.razorpayOrderId}`);
    if (existing.status !== 'paid') return { orderId: existing.id, amount, currency: 'INR' };
  }

  const order = await razorpay('/orders', {
    method: 'POST',
    body: { amount, currency: 'INR', receipt: registrationId, notes: { registrationId, eventId: reg.eventId } },
  });
  await ref.update({ razorpayOrderId: order.id, razorpayOrderAmount: amount });
  return { orderId: order.id, amount, currency: 'INR' };
});
