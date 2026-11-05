/*
 * Razorpay checkout on the client.
 *
 * The amount is never decided here. The browser only sends the registration id
 * to our own server (/api/razorpay/order), which looks up the event fee in
 * Firestore and creates the Razorpay order with the secret key. After payment,
 * the server (/api/razorpay/verify) checks Razorpay's signature with the secret
 * key before the registration is marked paid. The secret key never reaches the
 * browser; only the public key id (VITE_RAZORPAY_KEY_ID) does.
 *
 * Without a key id (the preview copy), payment runs in a clearly labelled
 * test mode so the flow can be tried end to end without charging anyone.
 */

export const isLivePayments = Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID);

let scriptPromise = null;
const loadCheckout = () => {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load Razorpay checkout. Check your connection and try again.'));
      };
      document.body.appendChild(s);
    });
  }
  return scriptPromise;
};

const postJson = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
};

/**
 * Pay for a registration. Resolves with { paymentId, orderId, mode } once the
 * server has verified the payment, or rejects with an Error.
 */
export async function payForRegistration({ registration, event }) {
  if (!isLivePayments) {
    // Preview test mode: no money moves and nothing is sent anywhere.
    await new Promise((r) => setTimeout(r, 900));
    return { paymentId: `test_pay_${Date.now()}`, orderId: `test_order_${Date.now()}`, mode: 'test' };
  }

  await loadCheckout();
  const order = await postJson('/api/razorpay/order', { registrationId: registration.id });

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: 'ORION',
      description: event.title,
      prefill: { name: registration.name, email: registration.email, contact: registration.phone },
      notes: { registrationId: registration.id },
      theme: { color: '#0b0c10' },
      handler: async (response) => {
        try {
          const verified = await postJson('/api/razorpay/verify', {
            registrationId: registration.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          resolve({ paymentId: verified.paymentId, orderId: verified.orderId, mode: 'live' });
        } catch (err) {
          reject(err);
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) },
    });
    rzp.on('payment.failed', (resp) => reject(new Error(resp.error?.description || 'Payment failed.')));
    rzp.open();
  });
}

/** Ask the server for a registration's status (works without signing in). */
export async function fetchRegistrationStatus({ registrationId, email }) {
  return postJson('/api/registrations/status', { registrationId, email });
}
