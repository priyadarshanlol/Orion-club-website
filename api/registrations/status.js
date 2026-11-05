// POST /api/registrations/status
// Look up registrations by email (and optionally a registration id).
// The email is required so ids alone can't be used to read other people's details.
import { adminDb, postHandler, HttpError, clean, isEmail } from '../_lib/admin.js';
import { publicView } from './create.js';

export default postHandler(async (body) => {
  const email = clean(body.email, 120).toLowerCase();
  const registrationId = clean(body.registrationId, 40);
  if (!isEmail(email)) throw new HttpError(400, 'Enter the email you registered with.');

  const db = adminDb();
  let docs;
  if (registrationId) {
    const snap = await db.collection('registrations').doc(registrationId).get();
    docs = snap.exists && snap.data().email === email ? [snap.data()] : [];
  } else {
    const snap = await db.collection('registrations').where('email', '==', email).limit(20).get();
    docs = snap.docs.map((d) => d.data());
  }
  return { registrations: docs.map(publicView) };
});
