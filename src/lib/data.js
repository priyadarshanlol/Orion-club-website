// Data models & Initial seed data for Club ORION at REVA University

export const INITIAL_WINGS = [
  {
    id: 'nanak',
    code: '01',
    name: 'NANAK',
    tagline: 'Discipline, Governance & Operations',
    iconName: 'ShieldCheck',
    badgeColor: 'from-amber-600 to-orange-600',
    colorHex: '#d97706',
    mission: 'Upholding club decorum, administering the 3-flag warning system, managing member points and star recognitions, duty hour rosters, and ensuring zero-delay logistical execution across REVA University.',
    scope: [
      '3-Flag disciplinary warning system & member conduct oversight',
      'Member points allocation, star citations & duty hour time tracking',
      'Auditorium crowd management, stage protocols & campus decorum',
      'Roster management, member renewals & re-hiring governance'
    ],
    leads: [
      { name: 'Karthik Raju', role: 'Wing Lead', branch: 'School of Mechanical Eng', year: '3rd Year', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 12345', social: { linkedin: '#' } },
      { name: 'Devika Pillai', role: 'Co-Lead', branch: 'School of Civil Eng', year: '2nd Year', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 23456', social: { linkedin: '#' } }
    ],
    projectHighlights: [
      { title: 'Zero-Infraction Protocol', description: 'Maintained 100% operational discipline across all major campus assemblies.' },
      { title: 'Digital Disciplinary Tracker', description: 'Built internal flag warning and duty hours tracking system for 100+ active members.' }
    ]
  },
  {
    id: 'zayd-bodhi',
    code: '02',
    name: 'ZAYD-BODHI',
    tagline: 'Internal & External Affairs',
    iconName: 'Globe',
    badgeColor: 'from-amber-500 to-yellow-500',
    colorHex: '#f59e0b',
    mission: 'Securing premier campus venues, orchestrating upcoming event logistics, securing administrative permissions, and spearheading inter-university delegations and external brand relationships.',
    scope: [
      'Campus venue bookings, authority permissions & event scheduling',
      'Inter-college fest delegations & external student network alliances',
      'University administrative liaisons & protocol clearances',
      'Next event venue readiness, guest reception & stage logistics'
    ],
    leads: [
      { name: 'Aarav Deshmukh', role: 'Wing Lead', branch: 'School of C&IT', year: '3rd Year', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 34567', social: { linkedin: '#', github: '#' } },
      { name: 'Ananya Hegde', role: 'Co-Lead', branch: 'School of ECE', year: '2nd Year', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 45678', social: { linkedin: '#', instagram: '#' } }
    ],
    projectHighlights: [
      { title: 'REVA Inter-College Summit', description: 'Partnered with 12 South Indian universities to host 1,500+ student delegates.' },
      { title: 'Campus Venue Logistics Network', description: 'Coordinated reservations across Kuwempu, Kalam, and Open Air Theatre venues.' }
    ]
  },
  {
    id: 'cultural',
    code: '03',
    name: 'KALA-SANSKRITI',
    tagline: 'Cultural & Performing Arts Wing',
    iconName: 'Sparkles',
    badgeColor: 'from-pink-500 to-rose-600',
    colorHex: '#ec4899',
    mission: 'Celebrating artistic brilliance, stage performances, musical concerts, dance battles, theatrical productions, and orchestrating cultural fests that illuminate REVA University.',
    scope: [
      'Stage curation, artist line-ups & performance schedules',
      'Music, dance, dramatics, and literary arts rehearsals & auditions',
      'State-level cultural fests & creative talent showcases',
      'Live concert productions & inter-collegiate cultural contingents'
    ],
    leads: [
      { name: 'Drishya Nair', role: 'Wing Lead', branch: 'School of Arts & Media', year: '3rd Year', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 56789', social: { linkedin: '#', instagram: '#' } },
      { name: 'Rohan Sharma', role: 'Co-Lead', branch: 'School of Commerce', year: '2nd Year', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 67890', social: { linkedin: '#' } }
    ],
    projectHighlights: [
      { title: 'Dhwani Mega Cultural Night', description: 'Attracted 2,800+ live student spectators with 14 performance troupes.' },
      { title: 'REVA Battle of the Bands', description: 'Hosted 18 college bands in high-voltage musical showdown at the OAT.' }
    ]
  },
  {
    id: 'arjuna',
    code: '04',
    name: 'ARJUNA',
    tagline: 'Technical & Web Innovation',
    iconName: 'Code2',
    badgeColor: 'from-purple-500 to-indigo-600',
    colorHex: '#8b5cf6',
    mission: 'Building cutting-edge technical products, web portals, IoT hardware exhibits, and modern software applications that empower REVA University.',
    scope: [
      'Frontend and backend web systems & cloud infrastructure',
      'Student portal development & open-source tools',
      'Technical hackathons, developer sprints & coding workshops',
      'Robotics, embedded systems & hardware prototypes'
    ],
    leads: [
      { name: 'Vidyut Nambiar', role: 'Wing Lead', branch: 'School of C&IT', year: '3rd Year', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 78901', social: { github: 'https://github.com', linkedin: '#' } },
      { name: 'Sneha Kulkarni', role: 'Co-Lead', branch: 'School of AI & DS', year: '2nd Year', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 89012', social: { github: 'https://github.com' } }
    ],
    projectHighlights: [
      { title: 'REVA Smart Campus Portal', description: 'Custom full-stack event ticketing platform used by 3,000+ REVA students.' },
      { title: 'ORION Bot 2.0', description: 'Autonomous campus rover demonstrated at REVA Innovation Expo.' }
    ]
  },
  {
    id: 'media',
    code: '05',
    name: 'MEDIA & MARKETING',
    tagline: 'Media Coverage, Campaigns & Gallery',
    iconName: 'Megaphone',
    badgeColor: 'from-cyan-500 to-blue-600',
    colorHex: '#0ea5e9',
    mission: 'Driving club branding, PR campaigns, social media virality, cinematic event coverage, and curating the official media gallery (up to 10 images and 5 videos per completed event).',
    scope: [
      'Post-event multimedia curation: Max 10 photos & 5 videos per event',
      'Digital marketing blitzes, viral reels & brand sponsorships',
      'Live event photojournalism, cinematic aftermovies & teasers',
      'Official club press releases, PR outreach & graphic branding'
    ],
    leads: [
      { name: 'Aditya Varma', role: 'Wing Lead', branch: 'School of Media & Journalism', year: '3rd Year', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 90123', social: { linkedin: '#', instagram: '#' } },
      { name: 'Pooja Hegde', role: 'Co-Lead', branch: 'School of Management', year: '2nd Year', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 01234', social: { linkedin: '#' } }
    ],
    projectHighlights: [
      { title: 'ORION 2026 Campus Viral Campaign', description: 'Generated over 500,000 digital impressions across university platforms.' },
      { title: 'Cinematic Event Archives', description: 'Produced 4K aftermovies and high-res event galleries across all campus seasons.' }
    ]
  }
];

export const INITIAL_AUDITION_SLOTS = [
  {
    id: 'slot-a',
    slotName: 'Slot A — Day 1',
    date: 'Sep 5, 2026',
    timeWindow: '4:30 PM - 5:15 PM',
    venue: 'Kuwempu Auditorium, Block 2',
    maxCapacity: 15,
    bookedCount: 12
  },
  {
    id: 'slot-b',
    slotName: 'Slot B — Day 1',
    date: 'Sep 5, 2026',
    timeWindow: '5:30 PM - 6:15 PM',
    venue: 'Kuwempu Auditorium, Block 2',
    maxCapacity: 15,
    bookedCount: 15 // Full
  },
  {
    id: 'slot-c',
    slotName: 'Slot C — Day 2',
    date: 'Sep 6, 2026',
    timeWindow: '4:30 PM - 5:15 PM',
    venue: 'APJ Abdul Kalam Hall',
    maxCapacity: 15,
    bookedCount: 8
  },
  {
    id: 'slot-d',
    slotName: 'Slot D — Day 2',
    date: 'Sep 6, 2026',
    timeWindow: '5:30 PM - 6:15 PM',
    venue: 'APJ Abdul Kalam Hall',
    maxCapacity: 15,
    bookedCount: 4
  },
  {
    id: 'slot-e',
    slotName: 'Slot E — Day 3',
    date: 'Sep 7, 2026',
    timeWindow: '4:30 PM - 5:15 PM',
    venue: 'CV Raman Seminar Complex',
    maxCapacity: 20,
    bookedCount: 14
  }
];

export const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: 'ORION Recruitment & Auditions 2026',
    wing: 'NANAK (Discipline) & ZAYD-BODHI (Venue)',
    wingId: 'nanak',
    date: 'September 5 - 7, 2026',
    time: '4:30 PM - 6:30 PM IST',
    timestamp: '2026-09-05T16:30:00',
    venue: 'Kuwempu Auditorium & Block 2 Seminar Halls',
    venueCoordinator: 'Deepak Raj (Internal & External Secretary)',
    description: 'The premier annual recruitment audition across 5 specialized wings. Candidate evaluation by Discipline Wing Directors and interactive wing panels.',
    bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    isUpcoming: true,
    isFinished: false,
    rsvpLink: '#recruitment',
    tags: ['Recruitment', 'Auditions', 'Flagship'],
    media: { images: [], videos: [] }
  },
  {
    id: 'evt-2',
    title: 'Aura 2026: Inter-College Cultural HackFest',
    wing: 'KALA-SANSKRITI (Cultural) & ARJUNA (Tech)',
    wingId: 'cultural',
    date: 'October 14, 2026',
    time: '9:00 AM - Next Day 9:00 AM',
    timestamp: '2026-10-14T09:00:00',
    venue: 'Main Open Air Theatre (OAT), REVA University',
    venueCoordinator: 'Deepak Raj (Internal & External Secretary)',
    description: '24-hour inter-college extravaganza combining rapid prototyping, creative short-film sprints, and live cultural stage performances under the stars.',
    bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    isUpcoming: true,
    isFinished: false,
    rsvpLink: '#events',
    tags: ['Fest', '24h Hackathon', 'Cultural Stage'],
    media: { images: [], videos: [] }
  },
  {
    id: 'evt-3',
    title: 'Tarang 2026: State Cultural Fest & Dance Conclave',
    wing: 'KALA-SANSKRITI (Cultural Wing)',
    wingId: 'cultural',
    date: 'November 18, 2026',
    time: '5:00 PM - 10:00 PM IST',
    timestamp: '2026-11-18T17:00:00',
    venue: 'REVA Central Auditorium & Grand Amphitheatre',
    venueCoordinator: 'Deepak Raj (Internal & External Secretary)',
    description: 'A grand spectacle of classical fusion, street dance battles, theatrical plays, and vocal harmony groups representing universities from across Karnataka.',
    bannerUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=800&auto=format&fit=crop&q=80',
    isUpcoming: true,
    isFinished: false,
    rsvpLink: '#events',
    tags: ['Cultural', 'Music & Dance', 'State Conclave'],
    media: { images: [], videos: [] }
  },
  {
    id: 'evt-past-1',
    title: 'Constellation Gala & Annual Awards 2025',
    wing: 'MEDIA & MARKETING / NANAK',
    wingId: 'media',
    date: 'December 18, 2025',
    time: '6:00 PM - 9:30 PM IST',
    venue: 'REVA Central Auditorium',
    venueCoordinator: 'ZAYD-BODHI Venue Desk',
    description: 'Celebrated the achievements of 100+ ORION members with performance showcases, disciplinary honor rolls, and star member awards.',
    bannerUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
    isUpcoming: false,
    isFinished: true,
    recapMetrics: { attendees: '650+', podiums: '12 Awards', satisfaction: '99%' },
    media: {
      images: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80'
      ],
      videos: [
        'https://assets.mixkit.co/videos/preview/mixkit-cheering-crowd-at-a-concert-41006-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-audience-raising-hands-at-a-concert-41007-large.mp4'
      ]
    }
  },
  {
    id: 'evt-past-2',
    title: 'Cyber-Vault Hardware & Tech Expo',
    wing: 'ARJUNA / MEDIA & MARKETING',
    wingId: 'arjuna',
    date: 'August 22, 2025',
    time: '10:00 AM - 4:00 PM IST',
    venue: 'REVA C&IT Exhibition Hall',
    venueCoordinator: 'ZAYD-BODHI Venue Desk',
    description: 'Showcased 18 IoT and autonomous robotics projects built by Arjuna wing members to faculty and industry visitors.',
    bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    isUpcoming: false,
    isFinished: true,
    recapMetrics: { projects: '18 Demos', visitors: '1,200+', sponsors: '3 Brands' },
    media: {
      images: [
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80'
      ],
      videos: [
        'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-42456-large.mp4'
      ]
    }
  },
  {
    id: 'evt-past-3',
    title: 'Dhwani Cultural Night & Battle of Bands',
    wing: 'KALA-SANSKRITI / MEDIA',
    wingId: 'cultural',
    date: 'April 15, 2025',
    time: '6:30 PM - 10:30 PM IST',
    venue: 'Main Open Air Theatre (OAT)',
    venueCoordinator: 'ZAYD-BODHI Venue Desk',
    description: 'A 4-hour live stage festival featuring university bands, fusion vocalists, and electrifying choreography ensembles.',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    isUpcoming: false,
    isFinished: true,
    recapMetrics: { performers: '85 Artists', crowd: '2,800+', applause: 'Unmatched' },
    media: {
      images: [
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80'
      ],
      videos: [
        'https://assets.mixkit.co/videos/preview/mixkit-cheering-crowd-at-a-concert-41006-large.mp4'
      ]
    }
  }
];

export const INITIAL_TEAM = [
  {
    category: 'Faculty Coordinators',
    members: [
      { name: 'Dr. R. K. Sharma', role: 'Chief Faculty Mentor', wing: 'Executive', branch: 'Directorate of Student Affairs', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', email: 'rksharma@reva.edu.in', phone: '+91 98450 11001' },
      { name: 'Prof. Ananya Roy', role: 'Faculty Coordinator', wing: 'Operations', branch: 'School of C&IT', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', email: 'ananya.roy@reva.edu.in', phone: '+91 98450 11002' }
    ]
  },
  {
    category: 'President',
    members: [
      { name: 'Siddharth Rao', role: 'President', wing: 'Core Leadership Committee', branch: 'School of CSE (4th Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', linkedin: '#', email: 'siddharth.r@reva.edu.in', phone: '+91 98450 11223' }
    ]
  },
  {
    category: 'Directors / Vice Presidents',
    members: [
      { name: 'Nikhil Rao', role: 'Director / VP — NANAK', wing: 'NANAK (Discipline & Governance)', branch: 'School of Mech (4th Year)', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80', email: 'nikhil.r@reva.edu.in', phone: '+91 98450 11003' },
      { name: 'Meera Krishnan', role: 'Director / VP — ZAYD-BODHI', wing: 'ZAYD-BODHI (Internal & External)', branch: 'School of ECE (4th Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', email: 'meera.k@reva.edu.in', phone: '+91 98450 11004' },
      { name: 'Drishya Nair', role: 'Director / VP — KALA-SANSKRITI', wing: 'KALA-SANSKRITI (Cultural)', branch: 'School of Arts & Media (4th Year)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', email: 'drishya.n@reva.edu.in', phone: '+91 98450 11005' },
      { name: 'Aarav Sharma', role: 'Director / VP — ARJUNA', wing: 'ARJUNA (Tech Projects)', branch: 'School of C&IT (4th Year)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', email: 'aarav.s@reva.edu.in', phone: '+91 98450 11006' },
      { name: 'Aarush Malhotra', role: 'Director / VP — PULSE', wing: 'MEDIA & MARKETING', branch: 'School of Media & Journalism (4th Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', email: 'aarush.m@reva.edu.in', phone: '+91 98450 11007' }
    ]
  },
  {
    category: 'Secretaries',
    members: [
      { name: 'Varun Tej', role: 'Discipline & Operations Secretary', wing: 'NANAK', branch: 'School of EEE (3rd Year)', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11008' },
      { name: 'Deepak Raj', role: 'Internal & External Secretary', wing: 'ZAYD-BODHI', branch: 'School of ECE (3rd Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11009' },
      { name: 'Ananya Hegde', role: 'Cultural Affairs Secretary', wing: 'KALA-SANSKRITI', branch: 'School of Arts & Media (3rd Year)', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11010' },
      { name: 'Kavya Nair', role: 'Technical Systems Secretary', wing: 'ARJUNA', branch: 'School of C&IT (3rd Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11011' },
      { name: 'Rhea Sen', role: 'Digital Media Secretary', wing: 'MEDIA & MARKETING', branch: 'School of Arts & Media (3rd Year)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11012' },
      { name: 'Samarth Kulkarni', role: 'Marketing & PR Secretary', wing: 'MEDIA & MARKETING', branch: 'School of Management (3rd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11013' }
    ]
  },
  {
    category: 'Leads',
    members: [
      { name: 'Vikramaditya Sen', role: 'Discipline & Flag Oversight Lead', wing: 'NANAK', branch: 'School of Management (3rd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11014' },
      { name: 'Rohan Verma', role: 'External Partnerships Lead', wing: 'ZAYD-BODHI', branch: 'School of ECE (3rd Year)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11015' },
      { name: 'Priya Sharma', role: 'Stage & Performance Lead', wing: 'KALA-SANSKRITI', branch: 'School of Arts (3rd Year)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11016' },
      { name: 'Karthik Raja', role: 'Full-Stack Lead', wing: 'ARJUNA', branch: 'School of C&IT (3rd Year)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11017' },
      { name: 'Aditya Varma', role: 'Digital Campaigns Lead', wing: 'MEDIA & MARKETING', branch: 'School of Media & Journalism (3rd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11018' },
      { name: 'Pooja Hegde', role: 'Brand Marketing & Outreach Lead', wing: 'MEDIA & MARKETING', branch: 'School of Management (3rd Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11019' }
    ]
  },
  {
    category: 'Co-Leads',
    members: [
      { name: 'Ananya Deshmukh', role: 'Duty Timings Co-Lead', wing: 'NANAK', branch: 'School of Commerce (2nd Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11020' },
      { name: 'Rahul V', role: 'Campus Venues Co-Lead', wing: 'ZAYD-BODHI', branch: 'School of Mech (2nd Year)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11021' },
      { name: 'Tarun Sharma', role: 'Choreography Co-Lead', wing: 'KALA-SANSKRITI', branch: 'School of Design (2nd Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11022' },
      { name: 'Sneha Patel', role: 'Web Apps Co-Lead', wing: 'ARJUNA', branch: 'School of C&IT (2nd Year)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11023' },
      { name: 'Farhan Ali', role: 'Visual Production Co-Lead', wing: 'MEDIA & MARKETING', branch: 'School of Design (2nd Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11024' },
      { name: 'Nikhil Verma', role: 'Sponsorships Co-Lead', wing: 'MEDIA & MARKETING', branch: 'School of Commerce (2nd Year)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', phone: '+91 98450 11025' }
    ]
  }
];

export const NOTICE_TICKER_ITEMS = [
  '🚨 RECRUITMENT 2026 IS LIVE! Sign in using REVA Microsoft SSO (@reva.edu.in).',
  '📅 Audition Slots filling fast for Day 1 & Day 2! Reserve your time window in the portal.',
  '✨ Explore our 5 Specialized Wings: Nanak (Discipline), Zayd-Bodhi (Venues), Kala-Sanskriti (Cultural), Arjuna (Tech), and Media & Marketing!',
  '🏆 Member Performance Leaderboard: Check your active points, 3-flag standing, and hours logged.'
];

// Registered Student Candidates Pool for Dynamic Keyword Autocomplete Search in Member Registration
export const INITIAL_STUDENT_CANDIDATES = [
  {
    id: 'cand_tanmay',
    name: 'Tanmay Bhatt',
    email: 'tanmay.b@reva.edu.in',
    srn: 'R23MJ044',
    branch: 'School of Media & Journalism',
    year: '2nd Year (Sophomore)',
    phone: '+91 98451 22334',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TanmayBhatt',
    preferredWing: 'MEDIA & MARKETING',
    roleSuggested: 'Digital Content Creator'
  },
  {
    id: 'cand_ananya',
    name: 'Ananya Sharma',
    email: 'ananya.s23cs@reva.edu.in',
    srn: 'R23CS112',
    branch: 'School of C&IT',
    year: '2nd Year (Sophomore)',
    phone: '+91 97410 99881',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaSharma',
    preferredWing: 'ARJUNA',
    roleSuggested: 'Frontend Developer'
  },
  {
    id: 'cand_rohan',
    name: 'Rohan Verma',
    email: 'rohan.v22ec@reva.edu.in',
    srn: 'R22EC089',
    branch: 'School of ECE',
    year: '3rd Year (Junior)',
    phone: '+91 98860 33445',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanVerma',
    preferredWing: 'ZAYD-BODHI',
    roleSuggested: 'External Liaison Associate'
  },
  {
    id: 'cand_sneha',
    name: 'Sneha Kulkarni',
    email: 'sneha.k23ai@reva.edu.in',
    srn: 'R23AI055',
    branch: 'School of AI & Data Science',
    year: '2nd Year (Sophomore)',
    phone: '+91 99001 55667',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaKulkarni',
    preferredWing: 'ARJUNA',
    roleSuggested: 'ML Model Contributor'
  },
  {
    id: 'cand_rahul',
    name: 'Rahul Iyer',
    email: 'rahul.i22me@reva.edu.in',
    srn: 'R22ME032',
    branch: 'School of Mechanical Engineering',
    year: '3rd Year (Junior)',
    phone: '+91 96112 77889',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulIyer',
    preferredWing: 'NANAK',
    roleSuggested: 'Auditorium Duty Coordinator'
  },
  {
    id: 'cand_pooja',
    name: 'Pooja Hegde',
    email: 'pooja.h23ba@reva.edu.in',
    srn: 'R23BA078',
    branch: 'School of Management Studies',
    year: '2nd Year (Sophomore)',
    phone: '+91 98455 66778',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PoojaHegde',
    preferredWing: 'MEDIA & MARKETING',
    roleSuggested: 'Sponsorship Executive'
  },
  {
    id: 'cand_drishya',
    name: 'Drishya Nair',
    email: 'drishya.n22bt@reva.edu.in',
    srn: 'R22BT019',
    branch: 'School of Arts & Media',
    year: '3rd Year (Junior)',
    phone: '+91 99801 23456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrishyaNair',
    preferredWing: 'KALA-SANSKRITI',
    roleSuggested: 'Cultural Stage Performer'
  },
  {
    id: 'cand_vikram',
    name: 'Vikramaditya Sen',
    email: 'vikram.s23cv@reva.edu.in',
    srn: 'R23CV041',
    branch: 'School of Civil Engineering',
    year: '2nd Year (Sophomore)',
    phone: '+91 94480 88990',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramadityaSen',
    preferredWing: 'NANAK',
    roleSuggested: 'Ground Discipline Marshal'
  },
  {
    id: 'cand_ishita',
    name: 'Ishita Roy',
    email: 'ishita.r23ar@reva.edu.in',
    srn: 'R23AR022',
    branch: 'School of Architecture',
    year: '2nd Year (Sophomore)',
    phone: '+91 97400 11223',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IshitaRoy',
    preferredWing: 'KALA-SANSKRITI',
    roleSuggested: 'Stage Decor & Production Lead'
  },
  {
    id: 'cand_varun',
    name: 'Varun Joshi',
    email: 'varun.j24cs@reva.edu.in',
    srn: 'R24CS204',
    branch: 'School of C&IT',
    year: '1st Year (Fresher)',
    phone: '+91 98800 44556',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VarunJoshi',
    preferredWing: 'MEDIA & MARKETING',
    roleSuggested: 'Event Videographer'
  }
];

// Initial Seed Dataset for Club Members & Performance Tracking across the 5 Wings
export const INITIAL_CLUB_MEMBERS = [
  {
    id: 'mem_siddharth_pres',
    name: 'Siddharth Rao',
    email: 'siddharth.r@reva.edu.in',
    srn: 'R21CS101',
    wing: 'CORE LEADERSHIP',
    role: 'Apex President',
    branch: 'School of CSE (4th Year)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11223',
    points: 1650,
    overallScore: 99,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 5,
    hoursWorked: 86.5,
    timingLogs: [
      { id: 'log_1', date: '2026-09-07', hours: 4.5, task: 'Presided over Core Council & Wing Alignment', category: 'Leadership', loggedBy: 'Admin' },
      { id: 'log_2', date: '2026-09-04', hours: 6.0, task: 'Recruitment 2026 Strategy & Auditions Setup', category: 'Recruitment', loggedBy: 'Admin' }
    ],
    joinedDate: '2023-08-15'
  },
  {
    id: 'mem_nikhil_nanak',
    name: 'Nikhil Rao',
    email: 'nikhil.r@reva.edu.in',
    srn: 'R21ME088',
    wing: 'NANAK',
    role: 'Director / VP — NANAK',
    branch: 'School of Mech (4th Year)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11003',
    points: 1540,
    overallScore: 98,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 5,
    hoursWorked: 80.0,
    timingLogs: [
      { id: 'log_nanak_1', date: '2026-09-06', hours: 5.0, task: 'Formulated Club Disciplinary Protocol & 3-Flag System', category: 'Discipline', loggedBy: 'Admin' }
    ],
    joinedDate: '2023-08-15'
  },
  {
    id: 'mem_meera_zayd',
    name: 'Meera Krishnan',
    email: 'meera.k@reva.edu.in',
    srn: 'R21EC088',
    wing: 'ZAYD-BODHI',
    role: 'Director / VP — ZAYD-BODHI',
    branch: 'School of ECE (4th Year)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11004',
    points: 1420,
    overallScore: 96,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 4,
    hoursWorked: 72.0,
    timingLogs: [
      { id: 'log_3', date: '2026-09-05', hours: 4.0, task: 'Secured Kuwempu Auditorium Venue Permissions', category: 'Venues', loggedBy: 'Admin' }
    ],
    joinedDate: '2023-08-15'
  },
  {
    id: 'mem_aarav_arjuna',
    name: 'Aarav Sharma',
    email: 'aarav.s@reva.edu.in',
    srn: 'R21CI033',
    wing: 'ARJUNA',
    role: 'Director / VP — ARJUNA',
    branch: 'School of C&IT (4th Year)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11006',
    points: 1480,
    overallScore: 97,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 5,
    hoursWorked: 74.0,
    timingLogs: [
      { id: 'log_4', date: '2026-09-06', hours: 5.5, task: 'Architected Cloud Database & System Logic', category: 'Tech Development', loggedBy: 'Admin' }
    ],
    joinedDate: '2023-08-15'
  },
  {
    id: 'mem_aarush_pulse',
    name: 'Aarush Malhotra',
    email: 'aarush.m@reva.edu.in',
    srn: 'R21MJ012',
    wing: 'MEDIA & MARKETING',
    role: 'Director / VP — PULSE',
    branch: 'School of Media & Journalism (4th Year)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11007',
    points: 1420,
    overallScore: 96,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 4,
    hoursWorked: 68.5,
    timingLogs: [
      { id: 'log_5', date: '2026-09-05', hours: 4.0, task: 'Spearheaded 2026 Media Campaigns & Press Kits', category: 'Marketing', loggedBy: 'Admin' }
    ],
    joinedDate: '2023-08-20'
  },
  {
    id: 'mem_drishya_kala',
    name: 'Drishya Nair',
    email: 'drishya.n@reva.edu.in',
    srn: 'R21AM045',
    wing: 'KALA-SANSKRITI',
    role: 'Director / VP — KALA-SANSKRITI',
    branch: 'School of Arts & Media (4th Year)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11005',
    points: 1390,
    overallScore: 95,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 4,
    hoursWorked: 66.0,
    timingLogs: [
      { id: 'log_cult_1', date: '2026-09-04', hours: 4.5, task: 'Conducted Audition Panels for Cultural Stage Troupe', category: 'Cultural Rehearsals', loggedBy: 'Admin' }
    ],
    joinedDate: '2023-09-01'
  },
  {
    id: 'mem_rhea_sen',
    name: 'Rhea Sen',
    email: 'rhea.s@reva.edu.in',
    srn: 'R22MJ044',
    wing: 'MEDIA & MARKETING',
    role: 'Digital Media Secretary',
    branch: 'School of Arts & Media (3rd Year)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11012',
    points: 1190,
    overallScore: 92,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 3,
    hoursWorked: 55.0,
    timingLogs: [
      { id: 'log_6', date: '2026-09-06', hours: 3.5, task: 'Curated 10 high-res gallery photos for Gala Recap', category: 'Media Gallery', loggedBy: 'Admin' }
    ],
    joinedDate: '2024-08-15'
  },
  {
    id: 'mem_samarth_k',
    name: 'Samarth Kulkarni',
    email: 'samarth.k@reva.edu.in',
    srn: 'R22MG092',
    wing: 'MEDIA & MARKETING',
    role: 'Marketing & PR Secretary',
    branch: 'School of Management (3rd Year)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11013',
    points: 1150,
    overallScore: 91,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 3,
    hoursWorked: 51.0,
    timingLogs: [
      { id: 'log_7', date: '2026-09-05', hours: 3.0, task: 'Managed sponsorship acquisition pipeline', category: 'Marketing', loggedBy: 'Admin' }
    ],
    joinedDate: '2024-08-15'
  },
  {
    id: 'mem_varun_tej',
    name: 'Varun Tej',
    email: 'varun.t@reva.edu.in',
    srn: 'R22EE061',
    wing: 'NANAK',
    role: 'Discipline & Operations Secretary',
    branch: 'School of EEE (3rd Year)',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11008',
    points: 1130,
    overallScore: 90,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 3,
    hoursWorked: 48.0,
    timingLogs: [
      { id: 'log_nanak_2', date: '2026-09-04', hours: 4.0, task: 'Logged member duty hours and warning roster', category: 'Discipline', loggedBy: 'Admin' }
    ],
    joinedDate: '2024-08-15'
  },
  {
    id: 'mem_ananya_hegde',
    name: 'Ananya Hegde',
    email: 'ananya.h@reva.edu.in',
    srn: 'R22EC014',
    wing: 'KALA-SANSKRITI',
    role: 'Cultural Affairs Secretary',
    branch: 'School of ECE (3rd Year)',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11010',
    points: 1110,
    overallScore: 89,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 3,
    hoursWorked: 46.5,
    timingLogs: [
      { id: 'log_cult_2', date: '2026-09-05', hours: 3.5, task: 'Finalized Battle of Bands technical rider and setlist', category: 'Cultural Rehearsals', loggedBy: 'Admin' }
    ],
    joinedDate: '2024-08-15'
  },
  {
    id: 'mem_karthik_raja',
    name: 'Karthik Raja',
    email: 'karthik.r@reva.edu.in',
    srn: 'R22CI090',
    wing: 'ARJUNA',
    role: 'Full-Stack Lead',
    branch: 'School of C&IT (3rd Year)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98450 11017',
    points: 1120,
    overallScore: 93,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 3,
    hoursWorked: 52.5,
    timingLogs: [
      { id: 'log_8', date: '2026-09-07', hours: 4.0, task: 'Built real-time audition slot tracker', category: 'Tech Development', loggedBy: 'Admin' }
    ],
    joinedDate: '2024-08-15'
  },
  {
    id: 'mem_alex_student',
    name: 'Alex Rodriguez',
    email: 'alex.r22ci045@reva.edu.in',
    srn: 'R22CI045',
    wing: 'ARJUNA',
    role: 'Active Member & Dev Contributor',
    branch: 'School of C&IT (2nd Year)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    phone: '+91 97412 34567',
    points: 870,
    overallScore: 88,
    flags: 3,
    flagHistory: [],
    status: 'active',
    stars: 2,
    hoursWorked: 38.0,
    timingLogs: [
      { id: 'log_9', date: '2026-09-06', hours: 3.5, task: 'Audition slot picker component development', category: 'Tech Development', loggedBy: 'Admin' }
    ],
    joinedDate: '2025-08-20'
  },
  {
    id: 'mem_sneha_warning',
    name: 'Sneha Roy',
    email: 'sneha.r@reva.edu.in',
    srn: 'R23AM077',
    wing: 'MEDIA & MARKETING',
    role: 'Campus Promotions Co-Lead',
    branch: 'School of Arts & Media (2nd Year)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98451 11223',
    points: 620,
    overallScore: 78,
    flags: 2, // 1 Warning issued
    flagHistory: [
      { date: '2026-09-01', reason: 'Unexcused absence from mandatory wing sync', issuedBy: 'NANAK Discipline Directorate' }
    ],
    status: 'warning',
    stars: 1,
    hoursWorked: 23.5,
    timingLogs: [
      { id: 'log_10', date: '2026-09-03', hours: 2.0, task: 'Handled brochure distribution at Block 1', category: 'Marketing', loggedBy: 'Admin' }
    ],
    joinedDate: '2025-08-25'
  },
  {
    id: 'mem_rohan_warning2',
    name: 'Rohan Gupta',
    email: 'rohan.g@reva.edu.in',
    srn: 'R23ME041',
    wing: 'ZAYD-BODHI',
    role: 'External Relations Associate',
    branch: 'School of Mech (2nd Year)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98451 22334',
    points: 410,
    overallScore: 68,
    flags: 1, // 2 Warnings issued
    flagHistory: [
      { date: '2026-08-22', reason: 'Late delivery of vendor logistics reports', issuedBy: 'NANAK Discipline Directorate' },
      { date: '2026-08-30', reason: 'Missed volunteer team briefing', issuedBy: 'NANAK Discipline Directorate' }
    ],
    status: 'warning',
    stars: 0,
    hoursWorked: 15.0,
    timingLogs: [
      { id: 'log_11', date: '2026-08-25', hours: 3.0, task: 'Campus perimeter poster run', category: 'Venues', loggedBy: 'Admin' }
    ],
    joinedDate: '2025-09-01'
  },
  {
    id: 'mem_rohit_fired',
    name: 'Rohit B. Gowda',
    email: 'rohit.b@reva.edu.in',
    srn: 'R23CV019',
    wing: 'NANAK',
    role: 'Former Ground Operations Associate',
    branch: 'School of Civil (2nd Year)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    phone: '+91 98451 33445',
    points: 120,
    overallScore: 40,
    flags: 0, // All 3 flags removed -> FIRED
    flagHistory: [
      { date: '2026-08-10', reason: 'Failure to show up for scheduled auditorium setup', issuedBy: 'NANAK Discipline Directorate' },
      { date: '2026-08-18', reason: 'Unprofessional conduct during club briefing', issuedBy: 'NANAK Discipline Directorate' },
      { date: '2026-08-28', reason: 'Continued non-compliance with club attendance policy. All 3 flags exhausted.', issuedBy: 'NANAK Discipline Directorate' }
    ],
    status: 'fired',
    stars: 0,
    hoursWorked: 6.5,
    timingLogs: [
      { id: 'log_12', date: '2026-08-08', hours: 2.5, task: 'Initial gear inventory check', category: 'Discipline', loggedBy: 'Admin' }
    ],
    joinedDate: '2025-08-10'
  }
];
