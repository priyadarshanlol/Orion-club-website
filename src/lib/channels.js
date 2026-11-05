// Official ORION communication channels, shown on the Connect with ORION page
// and in the footer. Only confirmed channels belong here: an entry with an empty
// url is hidden. Add Instagram, WhatsApp and the rest once confirmed.
export const OFFICIAL_CHANNELS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'ORION · REVA University',
    url: 'https://www.linkedin.com/company/orionreva/',
    note: 'Club news, recruitment drives and event recaps',
  },
  {
    id: 'email',
    label: 'Email',
    handle: 'orion.club@reva.edu.in',
    url: 'mailto:orion.club@reva.edu.in',
    note: 'Collaborations, sponsorships and faculty endorsements',
    unconfirmed: true,
  },
  { id: 'instagram', label: 'Instagram', handle: '', url: '', note: 'Event highlights and member stories' },
  { id: 'whatsapp', label: 'WhatsApp', handle: '', url: '', note: 'Announcements channel' },
  { id: 'youtube', label: 'YouTube', handle: '', url: '', note: 'Event films and aftermovies' },
];

export const CAMPUS_ADDRESS = 'REVA University, Rukmini Knowledge Park, Kattigenahalli, Yelahanka, Bengaluru 560064';
