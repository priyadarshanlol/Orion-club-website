// POST /api/registrations/create
// Creates an event registration. The server decides the fee, the status and
// whether the event is full, so a visitor cannot register for free or skip a waitlist.
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, postHandler, HttpError, clean, isEmail } from '../_lib/admin.js';
import { HACKATHON_ID, SCHOOLS, SEMESTERS, DOMAINS, PHONE_RE, UTR_RE } from '../../src/lib/hackathonForm.js';

export default postHandler(async (input) => {
  const hackathon = clean(input.eventId, 80) === HACKATHON_ID ? hackathonFrom(input) : null;
  const body = hackathon ? { ...input, ...hackathon.lead } : input;
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
    const team = hackathon ? null : teamFrom(body, settings.team, email);

    const existing = await tx.get(
      db.collection('registrations').where('eventId', '==', eventId).where('email', '==', email).limit(5)
    );
    const active = existing.docs.map((d) => d.data()).find((r) => r.status !== 'cancelled');
    if (active) return { ok: false, reason: 'already', registration: publicView(active) };
    if (hackathon) {
      const reused = await tx.get(db.collection('registrations').where('payment.utr', '==', hackathon.payment.utr).limit(1));
      if (!reused.empty) throw new HttpError(409, 'That UTR number has already been used for another registration. Check the transaction ID in your UPI app.');
    }

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
      ...(hackathon ? hackathon.record : {}),
      amount: fee,
      paid: false,
      status: full ? 'waitlisted' : hackathon && fee > 0 ? 'verifying' : fee > 0 ? 'pending_payment' : 'confirmed',
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

// Aarambh 2026: the step-by-step form (same questions as the club's Google Form).
function personFrom(p, label) {
  const person = {
    name: clean(p?.name, 100),
    email: clean(p?.email, 120).toLowerCase(),
    phone: clean(p?.phone, 20),
    srn: clean(p?.srn, 20).toUpperCase(),
    school: clean(p?.school, 60),
    sem: clean(p?.sem, 2),
    branch: clean(p?.branch, 60),
  };
  if (!person.name || !isEmail(person.email) || !PHONE_RE.test(person.phone) || !person.srn || !person.branch) {
    throw new HttpError(400, `${label}: please fill in name, email, contact number, SRN and branch.`);
  }
  if (!person.school || (!SCHOOLS.includes(person.school) && person.school.length < 2)) throw new HttpError(400, `${label}: choose the school.`);
  if (!SEMESTERS.includes(person.sem)) throw new HttpError(400, `${label}: choose the semester.`);
  return person;
}

function hackathonFrom(body) {
  const teamName = clean(body.teamName, 60);
  if (!teamName) throw new HttpError(400, 'Please enter a team name.');
  const teamSize = Number(body.teamSize);
  if (teamSize !== 2 && teamSize !== 3) throw new HttpError(400, 'Choose a team size of 2 or 3 members.');
  const lead = personFrom(body.lead, 'Team lead');
  const raw = Array.isArray(body.members) ? body.members : [];
  if (raw.length < teamSize - 1) throw new HttpError(400, `A team of ${teamSize} needs details for ${teamSize - 1} more member${teamSize > 2 ? 's' : ''}.`);
  const members = raw.slice(0, teamSize - 1).map((m, i) => personFrom(m, `Team member ${i + 2}`));
  const emails = [lead.email, ...members.map((m) => m.email)];
  if (new Set(emails).size !== emails.length) throw new HttpError(400, 'Each team member must use a different email.');
  const srns = [lead.srn, ...members.map((m) => m.srn)];
  if (new Set(srns).size !== srns.length) throw new HttpError(400, 'Each team member must have a different SRN.');
  const domain1 = clean(body.domain1, 80);
  const domain2 = clean(body.domain2, 80);
  if (!DOMAINS.includes(domain1) || !DOMAINS.includes(domain2)) throw new HttpError(400, 'Choose your 1st and 2nd domain preference.');
  if (domain1 === domain2) throw new HttpError(400, 'Your 2nd preference must be a different domain.');
  const utr = clean(body.payment?.utr, 40).replace(/\s/g, '').toUpperCase();
  const paidBy = clean(body.payment?.paidBy, 100);
  if (!UTR_RE.test(utr)) throw new HttpError(400, 'Enter the UTR / UPI transaction ID from your payment app.');
  if (!paidBy) throw new HttpError(400, 'Enter the name of the person who made the payment.');
  return {
    lead,
    payment: { utr, paidBy },
    record: {
      teamName,
      teamSize,
      sem: lead.sem,
      branch: lead.branch,
      school: lead.school,
      members,
      domains: [domain1, domain2],
      payment: { method: 'upi', utr, paidBy, submittedAt: new Date().toISOString() },
    },
  };
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
  payment: r.payment ? { paymentId: r.payment.paymentId, utr: r.payment.utr } : undefined,
});
