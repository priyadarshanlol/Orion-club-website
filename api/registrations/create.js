// POST /api/registrations/create
// Creates an event registration. The server decides the fee, the status and
// whether the event is full, so a visitor cannot register for free or skip a waitlist.
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, postHandler, HttpError, clean, isEmail } from '../_lib/admin.js';

export default postHandler(async (body) => {
  const eventId = clean(body.eventId, 80);
  const name = clean(body.name, 100);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 20);
  if (!eventId || !name || !isEmail(email) || !/^[0-9+ -]{10,15}$/.test(phone)) {
    throw new HttpError(400, 'Please fill in your name, a valid email and a valid phone number.');
  }

  const db = adminDb();
  const eventRef = db.collection('events').doc(eventId);

  return db.runTransaction(async (tx) => {
    const eventSnap = await tx.get(eventRef);
    if (!eventSnap.exists) throw new HttpError(404, 'Event not found.');
    const event = eventSnap.data();
    const settings = { fee: 0, capacity: 0, registrationOpen: true, ...(event.registration || {}) };
    if (event.isUpcoming === false || !settings.registrationOpen) throw new HttpError(409, 'Registration for this event is closed.');
    const team = teamFrom(body, settings.team, email);

    const existing = await tx.get(
      db.collection('registrations').where('eventId', '==', eventId).where('email', '==', email).limit(5)
    );
    const active = existing.docs.map((d) => d.data()).find((r) => r.status !== 'cancelled');
    if (active) return { ok: false, reason: 'already', registration: publicView(active) };

    const fee = Math.max(0, Math.round(Number(settings.fee) || 0));
    const capacity = Math.max(0, Math.round(Number(settings.capacity) || 0));
    const taken = Number(event.seatsTaken || 0);
    const full = capacity > 0 && taken >= capacity;

    const id = `REG-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const reg = {
      id,
      eventId,
      eventTitle: clean(event.title, 160),
      name,
      email,
      phone,
      srn: clean(body.srn, 20).toUpperCase(),
      school: clean(body.school, 100),
      year: clean(body.year, 30),
      ...(team || {}),
      amount: fee,
      paid: false,
      status: full ? 'waitlisted' : fee > 0 ? 'pending_payment' : 'confirmed',
      createdAt: new Date().toISOString(),
    };
    tx.set(db.collection('registrations').doc(id), reg);
    if (!full) tx.update(eventRef, { seatsTaken: FieldValue.increment(1) });
    return { ok: true, registration: publicView(reg) };
  });
});

// Team events (settings.team = { min, max }): the person filling the form is
// the team lead, plus (min - 1) to (max - 1) more members.
function teamFrom(body, teamRule, leadEmail) {
  if (!teamRule) return null;
  const min = Math.max(1, Number(teamRule.min) || 1);
  const max = Math.max(min, Number(teamRule.max) || min);
  const teamName = clean(body.teamName, 60);
  const raw = Array.isArray(body.members) ? body.members.slice(0, max) : [];
  const members = raw
    .map((m) => ({ name: clean(m?.name, 100), email: clean(m?.email, 120).toLowerCase(), srn: clean(m?.srn, 20).toUpperCase() }))
    .filter((m) => m.name || m.email);
  if (!teamName) throw new HttpError(400, 'Please enter a team name.');
  if (members.some((m) => !m.name || !isEmail(m.email))) throw new HttpError(400, 'Every team member needs a name and a valid email.');
  const emails = [leadEmail, ...members.map((m) => m.email)];
  if (new Set(emails).size !== emails.length) throw new HttpError(400, 'Each team member must use a different email.');
  const size = members.length + 1;
  if (size < min || size > max) throw new HttpError(400, `Teams must have ${min} to ${max} members, including you.`);
  return { teamName, members, teamSize: size };
}

// What the browser is allowed to see about a registration
export const publicView = (r) => ({
  id: r.id,
  eventId: r.eventId,
  eventTitle: r.eventTitle,
  name: r.name,
  email: r.email,
  phone: r.phone,
  teamName: r.teamName,
  teamSize: r.teamSize,
  amount: r.amount,
  paid: r.paid,
  status: r.status,
  createdAt: r.createdAt,
  payment: r.payment ? { paymentId: r.payment.paymentId } : undefined,
});
