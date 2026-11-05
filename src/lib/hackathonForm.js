// Aarambh 2026 registration form: the options and wording come straight from
// the club's Google Form, so the website asks exactly the same questions.
// Shared by the hackathon page (browser) and api/registrations/create.js (server).

export const HACKATHON_ID = 'aarambh-2026';

export const SCHOOLS = ['CSE Group 1', 'CSE Group 2', 'CSE Group 3', 'ECE', 'EEE', 'Civil', 'Mechanical'];
export const SEMESTERS = ['1', '3', '5', '7'];

export const DOMAINS = [
  'Cybersecurity & Network Intelligence',
  'Generative AI & Digital Forensics',
  'Smart Cities & Digital Twin',
  'Healthcare Technology & Medical AI',
  'Intelligent Logistics',
  'Software Engg & Code Intelligence',
  'Quantum Cryptography & Security',
  'Precision Agriculture & AgriTech',
  'Privacy-Preserving Distributed Computing',
  'Disaster Management & Autonomous Systems',
];

export const DOMAIN_NOTE =
  'Problem statement priority and team selection priority will be first come first serve basis. Problem statement distribution to the respective teams will be announced 2 days before the event.';

export const FORM_INTRO =
  'Join us for ORION HACKATHON 2026, organised by ORION at REVA University, Bengaluru. Participants must register in teams of 2–3 members, with an entry fee of ₹200 per team. The hackathon offers an opportunity to showcase your technical skills, collaborate with fellow innovators, develop creative solutions, and compete for exciting prizes. Registration will be confirmed only after successful payment verification.';

// UPI details decoded from the payment QR on the Google Form.
export const UPI = {
  qr: '/events/aarambh-upi-qr.png',
  id: '7483288123-f65f@ibl',
  name: 'MEET L PATEL',
  link: 'upi://pay?pa=7483288123-f65f@ibl&pn=MEET%20L%20PATEL&mc=0000&mode=02&purpose=00',
};

export const PAYMENT_INSTRUCTIONS = [
  'The registration fee is ₹200 per team (2–3 members). Scan the provided UPI QR code and pay exactly ₹200 to the displayed account. After completing the payment, enter the correct UPI Transaction ID/UTR number.',
  'Please note that submitting payment details does not automatically confirm your registration. Your registration will be confirmed only after the payment has been verified.',
];

// Set this to the group invite link to show the "Join WhatsApp group" button.
export const WHATSAPP_GROUP = { label: 'Aarambh Hackathon 2026', url: '' };

export const PHONE_RE = /^[0-9+ -]{10,15}$/;
export const UTR_RE = /^[A-Za-z0-9]{10,35}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checks one person's block. Returns an error message, or '' when it is complete.
export function personError(p, label) {
  if (!p.name?.trim()) return `${label}: enter the name.`;
  if (!EMAIL_RE.test(p.email?.trim() || '')) return `${label}: enter a valid email address.`;
  if (!PHONE_RE.test(p.phone?.trim() || '')) return `${label}: enter a valid contact number.`;
  if (!p.srn?.trim()) return `${label}: enter the SRN.`;
  if (!p.school?.trim()) return `${label}: choose the school.`;
  if (!SEMESTERS.includes(String(p.sem))) return `${label}: choose the semester.`;
  if (!p.branch?.trim()) return `${label}: enter the branch.`;
  return '';
}
