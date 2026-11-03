import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  Crown, 
  GitBranch, 
  ChevronRight, 
  Edit3, 
  Search, 
  X, 
  Check, 
  UserPlus,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Profile Name Card Component for Tree Nodes
function MemberNameCard({ name, role, wing, branch, avatar, colorBorder, isPresident, isAdmin, onEdit }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className={`glass-card p-3 rounded-2xl border ${colorBorder || 'border-slate-800'} bg-[#030304]/95 shadow-xl flex items-center gap-3 w-[210px] shrink-0 hover:border-amber-400 transition-all text-left relative z-10 group`}
    >
      <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-amber-400/60 shadow-md">
        <img
          src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
        />
        {isPresident && (
          <div className="absolute -top-1 -right-1 bg-amber-400 p-0.5 rounded-full shadow">
            <Crown className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="font-extrabold text-slate-100 text-xs font-display truncate">
          {name || 'Vacant Position'}
        </h5>
        <span className="text-[10px] font-bold text-amber-400 block truncate">
          {role}
        </span>
        {wing && (
          <span className="text-[9px] font-semibold text-cyan-400 block truncate">
            {wing}
          </span>
        )}
        <span className="text-[9px] text-slate-400 block truncate">
          {branch || 'School of C&IT'}
        </span>
      </div>

      {/* Admin Quick Edit Button */}
      {isAdmin && onEdit && (
        <button
          onClick={onEdit}
          className="absolute -top-2 -right-2 bg-amber-400 hover:bg-amber-300 text-slate-950 p-1.5 rounded-full shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all z-20"
          title="Admin: Edit or Replace Member in Tree"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}

export default function OrganizationalHierarchyTree() {
  const { currentUser } = useAuth();
  const { team, showToast } = useData();
  const [selectedWingCode, setSelectedWingCode] = useState('NANAK');

  // Default seed tree dataset for the 5 Wings
  const defaultWingsTree = [
    {
      code: 'NANAK',
      wingTitle: 'Wing 01: NANAK',
      wingCategory: 'Discipline, Governance & Operations',
      badgeColor: 'from-amber-600/20 to-orange-600/10 border-amber-600/40 text-amber-300',
      borderColor: 'border-amber-500/60',
      vp: { name: 'Karthik Raju', role: 'Director / VP — NANAK', branch: 'School of Mech (4th Year)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
      secretaries: [
        { name: 'Varun Tej', role: 'Discipline Secretary', branch: 'School of EEE (3rd Year)', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80' },
        { name: 'Devika Pillai', role: 'Operations Secretary', branch: 'School of Civil (3rd Year)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' }
      ],
      leads: [
        { name: 'Vikramaditya Sen', role: 'Protocol & Disciplinary Lead', branch: 'School of Management (3rd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Aditya Sharma', role: 'Roster & Duty Hours Lead', branch: 'School of Civil (3rd Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' }
      ],
      coLeads: [
        { name: 'Ananya Deshmukh', role: 'Discipline Co-Lead A', branch: 'School of Commerce (2nd Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
        { name: 'Ayush Sen', role: 'Discipline Co-Lead B', branch: 'School of C&IT (2nd Year)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
        { name: 'Kiran Gowda', role: 'Operations Co-Lead A', branch: 'School of CSE (2nd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Divya Reddy', role: 'Operations Co-Lead B', branch: 'School of Mech (2nd Year)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' }
      ],
      coordinators: [
        { name: 'Ritu Menon', role: 'Auditorium Marshal A', branch: 'School of Management (1st Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
        { name: 'Arjun Rao', role: 'Auditorium Marshal B', branch: 'School of CSE (1st Year)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
        { name: 'Sneha Patel', role: 'Duty Associate A', branch: 'School of ECE (1st Year)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
        { name: 'Varun Joshi', role: 'Duty Associate B', branch: 'School of Design (1st Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' }
      ]
    },
    {
      code: 'ZAYD',
      wingTitle: 'Wing 02: ZAYD-BODHI',
      wingCategory: 'Internal & External Affairs',
      badgeColor: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-300',
      borderColor: 'border-amber-400/60',
      vp: { name: 'Meera Krishnan', role: 'Director / VP — ZAYD-BODHI', branch: 'School of ECE (4th Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
      secretaries: [
        { name: 'Deepak Raj', role: 'Internal Affairs Secretary', branch: 'School of ECE (3rd Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Pooja Sharma', role: 'External Relations Secretary', branch: 'School of Arts (3rd Year)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' }
      ],
      leads: [
        { name: 'Aarav Deshmukh', role: 'Internal Wing Lead', branch: 'School of C&IT (3rd Year)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
        { name: 'Ananya Hegde', role: 'External Outreach Lead', branch: 'School of ECE (3rd Year)', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80' }
      ],
      coLeads: [
        { name: 'Priya Sharma', role: 'Internal Co-Lead A', branch: 'School of ECE (2nd Year)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
        { name: 'Ayush Kumar', role: 'Internal Co-Lead B', branch: 'School of CSE (2nd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Sneha Patel', role: 'External Co-Lead A', branch: 'School of Civil (2nd Year)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
        { name: 'Rohan Gupta', role: 'External Co-Lead B', branch: 'School of Mech (2nd Year)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' }
      ],
      coordinators: [
        { name: 'Arjun Rao', role: 'Student Volunteer A', branch: 'School of CSE (1st Year)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
        { name: 'Divya Reddy', role: 'Student Volunteer B', branch: 'School of ECE (1st Year)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
        { name: 'Kiran Gowda', role: 'Outreach Assistant A', branch: 'School of Mech (1st Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Ritu Menon', role: 'Outreach Assistant B', branch: 'School of Management (1st Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }
      ]
    },
    {
      code: 'KALA',
      wingTitle: 'Wing 03: KALA-SANSKRITI',
      wingCategory: 'Cultural & Performing Arts Wing',
      badgeColor: 'from-pink-500/20 to-rose-600/10 border-pink-500/40 text-pink-300',
      borderColor: 'border-pink-400/60',
      vp: { name: 'Drishya Nair', role: 'Director / VP — KALA-SANSKRITI', branch: 'School of Arts & Media (4th Year)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
      secretaries: [
        { name: 'Rohan Sharma', role: 'Music & Stage Secretary', branch: 'School of Commerce (3rd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Ananya V', role: 'Dance & Theater Secretary', branch: 'School of Humanities (3rd Year)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' }
      ],
      leads: [
        { name: 'Sneha Hegde', role: 'Choreography & Dance Lead', branch: 'School of Design (3rd Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
        { name: 'Rahul Sen', role: 'Acoustics & Bands Lead', branch: 'School of ECE (3rd Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' }
      ],
      coLeads: [
        { name: 'Amit Kumar', role: 'Stage Production Co-Lead', branch: 'School of Civil (2nd Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Bhavana M', role: 'Dramatics Co-Lead', branch: 'School of Media (2nd Year)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
        { name: 'Tarun Sharma', role: 'Artist Liaison Co-Lead A', branch: 'School of Design (2nd Year)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
        { name: 'Aarthi R', role: 'Artist Liaison Co-Lead B', branch: 'School of ECE (2nd Year)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' }
      ],
      coordinators: [
        { name: 'Sneha Patel', role: 'Cultural Volunteer A', branch: 'School of ECE (1st Year)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
        { name: 'Varun Joshi', role: 'Cultural Volunteer B', branch: 'School of Design (1st Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Ayush Sen', role: 'Rehearsal Coordinator A', branch: 'School of C&IT (1st Year)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
        { name: 'Priya S', role: 'Rehearsal Coordinator B', branch: 'School of Commerce (1st Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }
      ]
    },
    {
      code: 'ARJUNA',
      wingTitle: 'Wing 04: ARJUNA',
      wingCategory: 'Technical & Web Innovation',
      badgeColor: 'from-purple-500/20 to-indigo-600/10 border-purple-500/40 text-purple-300',
      borderColor: 'border-purple-400/60',
      vp: { name: 'Aarav Sharma', role: 'Director / VP — ARJUNA', branch: 'School of C&IT (4th Year)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
      secretaries: [
        { name: 'Kavya Nair', role: 'Software & Cloud Secretary', branch: 'School of C&IT (3rd Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
        { name: 'Harish Rao', role: 'Systems & Hardware Sec.', branch: 'School of ECE (3rd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' }
      ],
      leads: [
        { name: 'Vidyut Nambiar', role: 'Full-Stack Web Lead', branch: 'School of C&IT (3rd Year)', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
        { name: 'Sneha Kulkarni', role: 'AI & Data Lead', branch: 'School of AI & DS (2nd Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }
      ],
      coLeads: [
        { name: 'Rahul V', role: 'Frontend Co-Lead', branch: 'School of C&IT (2nd Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Kiran Gowda', role: 'Backend Co-Lead', branch: 'School of CSE (2nd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Ayush Sen', role: 'Robotics Co-Lead', branch: 'School of C&IT (2nd Year)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
        { name: 'Priya M', role: 'CyberSec Co-Lead', branch: 'School of ECE (2nd Year)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' }
      ],
      coordinators: [
        { name: 'Bhavana M', role: 'Dev Coordinator A', branch: 'School of Media (1st Year)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
        { name: 'Ritu Menon', role: 'Dev Coordinator B', branch: 'School of Management (1st Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
        { name: 'Arjun Rao', role: 'Tech Volunteer A', branch: 'School of CSE (1st Year)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
        { name: 'Divya Reddy', role: 'Tech Volunteer B', branch: 'School of Mech (1st Year)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' }
      ]
    },
    {
      code: 'MEDIA',
      wingTitle: 'Wing 05: MEDIA & MARKETING',
      wingCategory: 'Digital Media, Campaigns & Gallery',
      badgeColor: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/40 text-cyan-300',
      borderColor: 'border-cyan-400/60',
      vp: { name: 'Aarush Malhotra', role: 'Director / VP — MEDIA & MARKETING', branch: 'School of Media & Journalism (4th Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
      secretaries: [
        { name: 'Rhea Sen', role: 'Digital Media Secretary', branch: 'School of Arts & Media (3rd Year)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
        { name: 'Samarth Kulkarni', role: 'Marketing & PR Secretary', branch: 'School of Management (3rd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' }
      ],
      leads: [
        { name: 'Aditya Varma', role: 'Digital Campaigns Lead', branch: 'School of Media & Journalism (3rd Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Pooja Hegde', role: 'Brand Marketing & Outreach Lead', branch: 'School of Management (3rd Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }
      ],
      coLeads: [
        { name: 'Ananya Das', role: 'Social Media Co-Lead', branch: 'School of ECE (2nd Year)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
        { name: 'Farhan Ali', role: 'Visual Production Co-Lead', branch: 'School of Design (2nd Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Nikhil Verma', role: 'Sponsorships Co-Lead', branch: 'School of Commerce (2nd Year)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
        { name: 'Sneha Roy', role: 'Campus Promotions Co-Lead', branch: 'School of Arts & Media (2nd Year)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' }
      ],
      coordinators: [
        { name: 'Devansh Sharma', role: 'Media Editor Coordinator', branch: 'School of C&IT (1st Year)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
        { name: 'Riya Kapoor', role: 'PR Associate Coordinator', branch: 'School of Media (1st Year)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
        { name: 'Kunal Joshi', role: 'Campus Broadcast Associate', branch: 'School of Management (1st Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
        { name: 'Tanvi R.', role: 'Campaign Logistics Volunteer', branch: 'School of Design (1st Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }
      ]
    }
  ];

  const [wingsTree, setWingsTree] = useState(() => {
    const saved = localStorage.getItem('orion_tree_hierarchy');
    if (!saved) return defaultWingsTree;
    try {
      const parsed = JSON.parse(saved);
      // Migration: Ensure 5-wing layout and Kala-Sanskriti presence
      const hasArya = parsed.some(w => w.code === 'ARYA' || w.wingTitle?.includes('SAMARITAN'));
      const hasKala = parsed.some(w => w.code === 'KALA');
      if (hasArya || !hasKala || parsed.length !== 5) {
        localStorage.setItem('orion_tree_hierarchy', JSON.stringify(defaultWingsTree));
        return defaultWingsTree;
      }
      return parsed;
    } catch {
      return defaultWingsTree;
    }
  });

  const saveTreeData = (newTree) => {
    setWingsTree(newTree);
    localStorage.setItem('orion_tree_hierarchy', JSON.stringify(newTree));
    showToast('Updated tree node position!', 'success');
  };

  // State for Admin Position Edit Modal
  const [editingNode, setEditingNode] = useState(null); // { wingCode, nodeType, index, currentData }
  const [searchQuery, setSearchQuery] = useState('');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const openAdminEditModal = (wingCode, nodeType, index, currentData) => {
    setEditingNode({ wingCode, nodeType, index, currentData });
    setEditName(currentData?.name || '');
    setEditRole(currentData?.role || '');
    setEditBranch(currentData?.branch || '');
    setEditAvatar(currentData?.avatar || '');
    setSearchQuery('');
  };

  // Gather all member records from team data & tree for Admin search
  const allSearchableMembers = React.useMemo(() => {
    const list = [];
    if (team) {
      team.forEach(cat => {
        cat.members?.forEach(m => list.push(m));
      });
    }
    // Add default preset members
    list.push(
      { name: 'Siddharth Rao', role: 'President', branch: 'School of CSE (4th Year)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
      { name: 'Aarav Sharma', role: 'Director', branch: 'School of C&IT (4th Year)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
      { name: 'Meera Krishnan', role: 'Director', branch: 'School of ECE (4th Year)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
      { name: 'Deepak Raj', role: 'Secretary', branch: 'School of ECE (3rd Year)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
      { name: 'Rohan Verma', role: 'Lead', branch: 'School of ECE (3rd Year)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' }
    );
    // Unique by name
    const unique = [];
    const map = new Map();
    for (const item of list) {
      if (item.name && !map.has(item.name)) {
        map.set(item.name, true);
        unique.push(item);
      }
    }
    return unique;
  }, [team]);

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allSearchableMembers.filter(m => 
      m.name?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q) ||
      m.branch?.toLowerCase().includes(q)
    );
  }, [searchQuery, allSearchableMembers]);

  const handleSelectSearchResult = (selectedMember) => {
    setEditName(selectedMember.name);
    if (selectedMember.branch) setEditBranch(selectedMember.branch);
    if (selectedMember.avatar) setEditAvatar(selectedMember.avatar);
    showToast(`Selected member: ${selectedMember.name}`, 'info');
  };

  const handleSaveNodeEdit = (e) => {
    e.preventDefault();
    if (!editingNode) return;

    const { wingCode, nodeType, index } = editingNode;
    const updatedTree = wingsTree.map(w => {
      if (w.code !== wingCode) return w;

      const wingCopy = { ...w };
      const newNodeData = {
        name: editName.trim(),
        role: editRole.trim(),
        branch: editBranch.trim(),
        avatar: editAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
      };

      if (nodeType === 'vp') {
        wingCopy.vp = newNodeData;
      } else if (nodeType === 'secretaries') {
        const arr = [...wingCopy.secretaries];
        arr[index] = newNodeData;
        wingCopy.secretaries = arr;
      } else if (nodeType === 'leads') {
        const arr = [...wingCopy.leads];
        arr[index] = newNodeData;
        wingCopy.leads = arr;
      } else if (nodeType === 'coLeads') {
        const arr = [...wingCopy.coLeads];
        arr[index] = newNodeData;
        wingCopy.coLeads = arr;
      } else if (nodeType === 'coordinators') {
        const arr = [...wingCopy.coordinators];
        arr[index] = newNodeData;
        wingCopy.coordinators = arr;
      }

      return wingCopy;
    });

    saveTreeData(updatedTree);
    setEditingNode(null);
  };

  const activeWing = wingsTree.find(w => w.code === selectedWingCode) || wingsTree[0];
  const isAdmin = currentUser?.isAdmin;

  return (
    <div className="space-y-8 glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/30 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Interactive Wing Family Tree</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-display tracking-tight">
            Select a Wing to View Hierarchy Tree
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Choose any of the 5 specialized wings below to explore its reporting tree. {isAdmin && <strong className="text-amber-400">Admin Mode Enabled: Hover & Click pencil icon on any card to edit/replace members!</strong>}
          </p>
        </div>
      </div>

      {/* STEP 1: 5 WINGS SELECTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {wingsTree.map((w) => {
          const isSelected = selectedWingCode === w.code;
          return (
            <motion.button
              key={w.code}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedWingCode(w.code)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/15 ring-2 ring-amber-400/40'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border inline-block mb-1.5 ${w.badgeColor}`}>
                  {w.code}
                </span>
                <h4 className="font-extrabold text-sm text-slate-100 font-display tracking-wider leading-snug">
                  {w.wingTitle}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 font-medium">
                  {w.wingCategory}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-bold">
                <span className={isSelected ? 'text-amber-400' : 'text-slate-500'}>
                  {isSelected ? 'Viewing Tree' : 'Click to View'}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90 text-amber-400' : 'text-slate-500'}`} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* STEP 2: ACTIVE WING FAMILY TREE DIAGRAM */}
      <div className="pt-6 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">ACTIVE HIERARCHY TREE</span>
            <h4 className="text-xl font-extrabold text-slate-100 font-display flex items-center gap-2">
              <span>{activeWing.wingTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {activeWing.wingCategory}
              </span>
            </h4>
          </div>
        </div>

        {/* TREE DIAGRAM CANVAS (SPACIOUS & PERFECTLY ALIGNED) */}
        <div className="overflow-x-auto pb-10 pt-2 custom-scrollbar">
          <div className="min-w-[1000px] flex flex-col items-center space-y-6">
            
            {/* LEVEL 1: APEX PRESIDENT */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-amber-400" />
                Apex Executive Leadership
              </div>

              <MemberNameCard
                name="Siddharth Rao"
                role="President"
                wing="Core Leadership Committee"
                branch="School of CSE (4th Year)"
                avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                colorBorder="border-amber-400/90 bg-amber-500/10 shadow-amber-500/20"
                isPresident={true}
              />

              {/* Vertical line down to Wing Director */}
              <div className="w-0.5 h-7 bg-gradient-to-b from-amber-400 to-cyan-400 my-2" />
            </div>

            {/* LEVEL 2: DIRECTOR / VP OF SELECTED WING */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 mb-2">
                WING DIRECTOR / VP
              </div>

              <MemberNameCard
                name={activeWing.vp.name}
                role={activeWing.vp.role}
                wing={activeWing.wingCategory}
                branch={activeWing.vp.branch}
                avatar={activeWing.vp.avatar}
                colorBorder={activeWing.borderColor}
                isAdmin={isAdmin}
                onEdit={() => openAdminEditModal(activeWing.code, 'vp', 0, activeWing.vp)}
              />

              {/* Vertical line down to 2 Secretaries Branch */}
              <div className="w-0.5 h-6 bg-cyan-400 my-1" />
            </div>

            {/* LEVEL 3 TO LEVEL 6: SPREAD OUT 2 SECRETARY SUBTREES */}
            <div className="flex flex-col items-center w-full">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 mb-2">
                2 WING SECRETARIES
              </div>

              {/* Main Top Horizontal Connector Line between Secretary 1 and Secretary 2 */}
              <div className="relative w-[500px]">
                <div className="h-0.5 bg-amber-400 w-full" />
              </div>

              {/* 2 Subtrees side-by-side: Secretary 1 Subtree (left) & Secretary 2 Subtree (right) with 60px Gap */}
              <div className="flex gap-16 pt-2">
                {activeWing.secretaries.map((sec, idx) => (
                  <div key={idx} className="flex flex-col items-center w-[440px]">
                    
                    {/* Vertical connector line from top bar down to Secretary Card */}
                    <div className="w-0.5 h-4 bg-amber-400" />
                    
                    {/* SECRETARY CARD */}
                    <MemberNameCard
                      name={sec.name}
                      role={sec.role}
                      wing={activeWing.code}
                      branch={sec.branch}
                      avatar={sec.avatar}
                      colorBorder="border-amber-500/60"
                      isAdmin={isAdmin}
                      onEdit={() => openAdminEditModal(activeWing.code, 'secretaries', idx, sec)}
                    />

                    {/* Vertical line down to Lead */}
                    <div className="w-0.5 h-6 bg-cyan-400 my-1" />

                    {/* WING LEAD CARD */}
                    <MemberNameCard
                      name={activeWing.leads[idx].name}
                      role={activeWing.leads[idx].role}
                      wing={activeWing.code}
                      branch={activeWing.leads[idx].branch}
                      avatar={activeWing.leads[idx].avatar}
                      colorBorder="border-cyan-500/50"
                      isAdmin={isAdmin}
                      onEdit={() => openAdminEditModal(activeWing.code, 'leads', idx, activeWing.leads[idx])}
                    />

                    {/* Vertical line down to 2 Co-Leads Branch */}
                    <div className="w-0.5 h-5 bg-cyan-400 my-1" />

                    {/* HORIZONTAL CONNECTOR LINE FOR THE 2 CO-LEADS OF THIS LEAD */}
                    <div className="relative w-[232px]">
                      <div className="h-0.5 bg-slate-700 w-full" />
                    </div>

                    {/* 2 CO-LEADS + 2 COORDINATORS SUBTREE */}
                    <div className="flex justify-between w-[440px] pt-1">
                      {/* Left Co-Lead + Coordinator Column */}
                      <div className="flex flex-col items-center w-[210px]">
                        <div className="w-0.5 h-3 bg-slate-700" />
                        <MemberNameCard
                          name={activeWing.coLeads[idx * 2]?.name}
                          role={activeWing.coLeads[idx * 2]?.role}
                          wing={activeWing.code}
                          branch={activeWing.coLeads[idx * 2]?.branch}
                          avatar={activeWing.coLeads[idx * 2]?.avatar}
                          colorBorder="border-slate-800"
                          isAdmin={isAdmin}
                          onEdit={() => openAdminEditModal(activeWing.code, 'coLeads', idx * 2, activeWing.coLeads[idx * 2])}
                        />
                        <div className="w-0.5 h-3 bg-slate-800 my-1" />
                        <MemberNameCard
                          name={activeWing.coordinators[idx * 2]?.name}
                          role={activeWing.coordinators[idx * 2]?.role}
                          wing={activeWing.code}
                          branch={activeWing.coordinators[idx * 2]?.branch}
                          avatar={activeWing.coordinators[idx * 2]?.avatar}
                          colorBorder="border-emerald-500/30"
                          isAdmin={isAdmin}
                          onEdit={() => openAdminEditModal(activeWing.code, 'coordinators', idx * 2, activeWing.coordinators[idx * 2])}
                        />
                      </div>

                      {/* Right Co-Lead + Coordinator Column */}
                      <div className="flex flex-col items-center w-[210px]">
                        <div className="w-0.5 h-3 bg-slate-700" />
                        <MemberNameCard
                          name={activeWing.coLeads[idx * 2 + 1]?.name}
                          role={activeWing.coLeads[idx * 2 + 1]?.role}
                          wing={activeWing.code}
                          branch={activeWing.coLeads[idx * 2 + 1]?.branch}
                          avatar={activeWing.coLeads[idx * 2 + 1]?.avatar}
                          colorBorder="border-slate-800"
                          isAdmin={isAdmin}
                          onEdit={() => openAdminEditModal(activeWing.code, 'coLeads', idx * 2 + 1, activeWing.coLeads[idx * 2 + 1])}
                        />
                        <div className="w-0.5 h-3 bg-slate-800 my-1" />
                        <MemberNameCard
                          name={activeWing.coordinators[idx * 2 + 1]?.name}
                          role={activeWing.coordinators[idx * 2 + 1]?.role}
                          wing={activeWing.code}
                          branch={activeWing.coordinators[idx * 2 + 1]?.branch}
                          avatar={activeWing.coordinators[idx * 2 + 1]?.avatar}
                          colorBorder="border-emerald-500/30"
                          isAdmin={isAdmin}
                          onEdit={() => openAdminEditModal(activeWing.code, 'coordinators', idx * 2 + 1, activeWing.coordinators[idx * 2 + 1])}
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER SUMMARY */}
      <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Interactive Wing Hierarchy: President → Director/VP → 2 Secretaries → 2 Leads → 4 Co-Leads → Coordinators.</span>
        </div>
        <div className="text-[11px] text-amber-400 font-bold font-mono">
          6 Specialized Wings • 120+ Total Members
        </div>
      </div>

      {/* ADMIN EDIT POSITION & MEMBER SEARCH MODAL */}
      <AnimatePresence>
        {editingNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0c0f] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-slate-100"
            >
              <button
                onClick={() => setEditingNode(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl font-display text-slate-100">
                    Assign / Update Tree Position
                  </h3>
                  <p className="text-xs text-amber-400 font-medium">
                    Wing: {editingNode.wingCode} • Role: {editRole || editingNode.nodeType}
                  </p>
                </div>
              </div>

              {/* Member Search Bar */}
              <div className="space-y-2 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>Search Registered Members / Students</span>
                </label>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type name, USN, email or department keyword..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-400"
                />

                {searchResults.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 pt-1 border-t border-slate-800">
                    {searchResults.map((m, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSearchResult(m)}
                        className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <img src={m.avatar} className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-semibold text-slate-200">{m.name}</span>
                          <span className="text-[10px] text-slate-400">({m.branch})</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold">Select</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Details Form */}
              <form onSubmit={handleSaveNodeEdit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Member Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter full student name"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="e.g. Internal Affairs Secretary"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">School / Branch</label>
                  <input
                    type="text"
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    placeholder="e.g. School of ECE (3rd Year)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Profile Avatar Photo URL</label>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditName('Vacant Position');
                      setEditBranch('');
                      setEditAvatar('');
                      showToast('Position set to vacant', 'info');
                    }}
                    className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold text-xs"
                  >
                    Vacate Position
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 font-extrabold text-slate-950 rounded-xl text-xs shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Node Position</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
