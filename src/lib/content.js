// Site content for the multi-page ORION experience: wing star charts, milestones,
// notices, venues, discipline records, duty rosters and the charter.
// Wing ids match INITIAL_WINGS in data.js.

// Each wing is anchored to one of the real stars of Orion. Coordinates are J2000.
// Star chart nodes use a 0-100 viewBox; edges index into nodes. Nodes carry no
// labels on purpose: the charts are decorative, not a list of wing duties.
export const WING_CONSTELLATIONS = {
  discipline: {
    star: 'Alnilam',
    designation: 'Epsilon Orionis',
    ra: '05h 36m 13s',
    dec: '-01° 12′ 07″',
    distance: '≈2,000 ly',
    spectral: 'B0 Ia · Blue supergiant',
    sector: 'The Belt · centre star',
    nodes: [
      { x: 50, y: 10, mag: 1 },
      { x: 22, y: 34, mag: 2 },
      { x: 78, y: 34, mag: 2 },
      { x: 50, y: 50, mag: 1 },
      { x: 26, y: 74, mag: 3 },
      { x: 74, y: 74, mag: 3 },
      { x: 50, y: 92, mag: 2 },
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6]],
  },
  'internal-external': {
    star: 'Bellatrix',
    designation: 'Gamma Orionis',
    ra: '05h 25m 08s',
    dec: '+06° 20′ 59″',
    distance: '250 ly',
    spectral: 'B2 III · Blue giant',
    sector: 'The Western Shoulder',
    nodes: [
      { x: 16, y: 22, mag: 2 },
      { x: 44, y: 14, mag: 1 },
      { x: 74, y: 24, mag: 2 },
      { x: 54, y: 48, mag: 1 },
      { x: 86, y: 58, mag: 3 },
      { x: 28, y: 66, mag: 3 },
      { x: 60, y: 86, mag: 2 },
    ],
    edges: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [3, 6], [4, 6]],
  },
  cultural: {
    star: 'Betelgeuse',
    designation: 'Alpha Orionis',
    ra: '05h 55m 10s',
    dec: '+07° 24′ 25″',
    distance: '≈550 ly',
    spectral: 'M1–2 Ia · Red supergiant',
    sector: 'The Eastern Shoulder',
    nodes: [
      { x: 50, y: 12, mag: 1 },
      { x: 20, y: 30, mag: 2 },
      { x: 80, y: 30, mag: 2 },
      { x: 30, y: 58, mag: 2 },
      { x: 70, y: 58, mag: 3 },
      { x: 12, y: 80, mag: 3 },
      { x: 50, y: 88, mag: 1 },
      { x: 88, y: 80, mag: 3 },
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 6], [4, 6], [3, 5], [4, 7], [1, 2]],
  },
  technical: {
    star: 'Rigel',
    designation: 'Beta Orionis',
    ra: '05h 14m 32s',
    dec: '-08° 12′ 06″',
    distance: '≈860 ly',
    spectral: 'B8 Ia · Blue supergiant',
    sector: 'The Western Foot',
    nodes: [
      { x: 50, y: 10, mag: 1 },
      { x: 18, y: 30, mag: 2 },
      { x: 82, y: 30, mag: 2 },
      { x: 50, y: 46, mag: 1 },
      { x: 14, y: 70, mag: 3 },
      { x: 38, y: 88, mag: 3 },
      { x: 64, y: 88, mag: 2 },
      { x: 88, y: 70, mag: 2 },
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [3, 5], [3, 6], [2, 7], [6, 7], [4, 5]],
  },
  media: {
    star: 'Saiph',
    designation: 'Kappa Orionis',
    ra: '05h 47m 45s',
    dec: '-09° 40′ 11″',
    distance: '≈650 ly',
    spectral: 'B0.5 Ia · Blue supergiant',
    sector: 'The Eastern Foot',
    nodes: [
      { x: 50, y: 12, mag: 1 },
      { x: 20, y: 34, mag: 2 },
      { x: 80, y: 34, mag: 2 },
      { x: 50, y: 52, mag: 1 },
      { x: 24, y: 80, mag: 2 },
      { x: 76, y: 80, mag: 3 },
      { x: 50, y: 92, mag: 3 },
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6]],
  },
};

// Club milestones, drawn from the wings' own project highlights.
export const MILESTONES = [
  { value: '2,800+', label: 'Dhwani Cultural Night', detail: 'Live spectators across 14 performance troupes at the Open Air Theatre.' },
  { value: '500K+', label: 'Campaign impressions', detail: 'The ORION 2026 campus campaign across university platforms.' },
  { value: '1,500+', label: 'Summit delegates', detail: 'Students from 12 South Indian universities at the REVA Inter-College Summit.' },
  { value: '3,000+', label: 'Smart Campus Portal users', detail: 'Full-stack ticketing platform built and run by Technical Wing.' },
];

export const DISPATCH_CATEGORIES = ['General', 'Recruitment', 'Events', 'Urgent'];

export const INITIAL_DISPATCHES = [
  {
    id: 'dsp-1',
    category: 'Recruitment',
    date: '2026-09-01',
    author: 'Siddharth Rao (President)',
    title: 'Recruitment 2026 is open across all five wings',
    body: 'Sign in with your REVA Microsoft account, pick a primary and secondary wing, and book an audition slot. Every seat is earned in the audition room.',
    link: { label: 'Open the recruitment portal', to: '/recruitment' },
  },
  {
    id: 'dsp-2',
    category: 'Events',
    date: '2026-09-28',
    author: 'Deepak Raj (Internal & External Secretary)',
    title: 'Aura 2026 venue confirmed: Main Open Air Theatre',
    body: 'Internal & External Wing has secured the OAT for the 24-hour HackFest. Volunteer briefings start the week before; check your duty roster.',
    link: { label: 'See the event', to: '/events' },
  },
  {
    id: 'dsp-3',
    category: 'General',
    date: '2026-10-05',
    author: 'Nikhil Rao (Director, Discipline Wing)',
    title: 'Charter review: the 3-flag system for this term',
    body: 'Every member starts the term with three flags. Read the charter before your first duty shift. Inside ORION, every position is earned, not favoured.',
    link: { label: 'Read the charter', to: '/discipline#charter' },
  },
];

export const VENUE_STATUSES = ['Available', 'Booked', 'Maintenance'];

export const INITIAL_VENUES = [
  {
    id: 'ven-kuwempu',
    name: 'Kuwempu Auditorium',
    block: 'Main Academic Block',
    capacity: 1200,
    liaison: 'Deepak Raj (Internal & External Wing)',
    status: 'Booked',
    bookedFor: 'Recruitment & Auditions 2026',
    amenities: ['Dual projectors', 'Line-array sound', 'Stage lighting rig', 'Green rooms (2)'],
  },
  {
    id: 'ven-oat',
    name: 'Main Open Air Theatre (OAT)',
    block: 'Central Campus',
    capacity: 3000,
    liaison: 'Rahul V (Internal & External Wing)',
    status: 'Booked',
    bookedFor: 'Aura 2026 HackFest',
    amenities: ['Acoustic shell', 'Perimeter floodlights', 'Generator backup', 'Green rooms (3)'],
  },
  {
    id: 'ven-kalam',
    name: 'APJ Abdul Kalam Hall',
    block: 'C&IT Block',
    capacity: 450,
    liaison: 'Meera Krishnan (Internal & External Wing)',
    status: 'Available',
    bookedFor: '',
    amenities: ['4K projector', 'Wireless mics (8)', 'Recording console'],
  },
  {
    id: 'ven-seminar',
    name: 'Block 2 Seminar Halls',
    block: 'Block 2, 1st floor',
    capacity: 120,
    liaison: 'Deepak Raj (Internal & External Wing)',
    status: 'Available',
    bookedFor: '',
    amenities: ['Smart boards', 'Audition panels', 'Waiting lounge'],
  },
  {
    id: 'ven-cit-expo',
    name: 'C&IT Exhibition Hall',
    block: 'C&IT Block, ground floor',
    capacity: 600,
    liaison: 'Aarav Sharma (Technical Wing)',
    status: 'Maintenance',
    bookedFor: 'Electrical upgrade',
    amenities: ['Exhibit bays (24)', 'Fibre drops', 'Power islands'],
  },
];

export const CASE_SEVERITIES = ['Commendation', 'Low', 'Medium', 'High'];

export const INITIAL_DISCIPLINE_CASES = [
  {
    id: 'case-101',
    date: '2026-09-07',
    memberId: 'mem_karthik_raja',
    memberName: 'Karthik Raja',
    wing: 'Technical Wing',
    severity: 'Commendation',
    category: 'Volunteer readiness',
    finding: 'Stepped in at short notice to restore the audition booking server during the recruitment rush.',
    action: 'Star citation and +100 points.',
    status: 'Logged',
    officer: 'Nikhil Rao',
  },
  {
    id: 'case-102',
    date: '2026-09-12',
    memberId: 'mem_sneha_warning',
    memberName: 'Sneha Roy',
    wing: 'Media & Marketing Wing',
    severity: 'Low',
    category: 'Event duty',
    finding: 'Reported 30 minutes late for the camera kit check before the recruitment shoot.',
    action: 'One flag removed. Completed a make-up inventory shift.',
    status: 'Resolved',
    officer: 'Varun Tej',
  },
  {
    id: 'case-103',
    date: '2026-09-20',
    memberId: 'mem_rohan_warning2',
    memberName: 'Rohan Gupta',
    wing: 'Internal & External Wing',
    severity: 'Medium',
    category: 'Attendance',
    finding: 'Missed two consecutive venue walk-throughs without notice.',
    action: 'Two flags removed. Assigned supervised venue duty.',
    status: 'Under review',
    officer: 'Nikhil Rao',
  },
  {
    id: 'case-104',
    date: '2026-08-30',
    memberId: 'mem_rohit_fired',
    memberName: 'Rohit B. Gowda',
    wing: 'Discipline Wing',
    severity: 'High',
    category: 'Conduct',
    finding: 'Lost all three flags across the term after repeated duty absences.',
    action: 'Membership ended. Eligible to re-apply next recruitment.',
    status: 'Closed',
    officer: 'Nikhil Rao',
  },
];

export const DUTY_ROSTERS = [
  {
    id: 'duty-recruitment',
    event: 'Recruitment & Auditions 2026',
    eventId: 'evt-1',
    posts: ['Kuwempu main gate', 'Audition queue desk', 'Panel room runners'],
    marshals: ['Varun Tej', 'Vikramaditya Sen', 'Ananya Deshmukh'],
    filled: 12,
    needed: 12,
  },
  {
    id: 'duty-aura',
    event: 'Aura 2026 HackFest',
    eventId: 'evt-2',
    posts: ['OAT perimeter', 'Hack-zone power watch', 'Guest escort'],
    marshals: ['Nikhil Rao', 'Rahul V', 'Karthik Raja'],
    filled: 9,
    needed: 16,
  },
  {
    id: 'duty-tarang',
    event: 'Tarang 2026 Cultural Fest',
    eventId: 'evt-3',
    posts: ['Green-room protocol', 'Crowd circulation', 'Stage wings'],
    marshals: ['Priya Sharma', 'Tarun Sharma'],
    filled: 5,
    needed: 14,
  },
];

// Draft wording for the club to edit.
export const CHARTER = [
  {
    article: 'Article I',
    title: 'Earned, not favoured',
    text: 'No member holds a position, a project or a stage through favours, seniority or friendship. Every role is won in auditions, duty and delivered work, and can be lost the same way.',
  },
  {
    article: 'Article II',
    title: 'The three flags',
    text: 'Every member begins the term with three flags. Discipline Wing removes a flag for a missed duty, a broken protocol or a conduct breach. A member who loses all three leaves the club and may re-apply at the next recruitment.',
  },
  {
    article: 'Article III',
    title: 'Points, stars and hours',
    text: 'Points, star citations and logged duty hours are recorded openly on the member leaderboard. They decide promotions, renewals and stage credits.',
  },
  {
    article: 'Article IV',
    title: 'Independent discipline',
    text: 'Discipline Wing rules on attendance, safety and conduct without veto from other wings. Every ruling is written into the discipline log with its reason.',
  },
];

export const ABOUT_PILLARS = [
  {
    title: 'Merit over seniority',
    text: 'First-years and final-years audition side by side. Titles follow work, never the other way round.',
  },
  {
    title: 'Five wings, one sky',
    text: 'Engineers, performers, organisers and storytellers plan every flagship event together, from venue to aftermovie.',
  },
  {
    title: 'Accountability on record',
    text: 'Flags, points, stars and duty hours are tracked openly, and Discipline Wing keeps the club honest without favourites.',
  },
];

export const CREST_PARTS = [
  {
    title: 'Twin rising wings',
    text: 'Two mirrored halves climb together: craft and expression moving upward at the same speed.',
  },
  {
    title: 'The open centre',
    text: 'Nothing is hidden at the heart of the crest. Merit is visible and every decision is on record.',
  },
  {
    title: 'The star at the base',
    text: 'Three points ground the mark: discipline, delivery and the people who make the club.',
  },
];

export const INDUCTION_CREED =
  'We do not promise titles. We promise hard problems, honest feedback, peers who push you, and work that leaves a mark on REVA. Earned, not favoured.';
