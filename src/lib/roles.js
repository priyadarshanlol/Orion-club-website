// Role helpers for the three portals: member dashboard, committee console, discipline console.

const LEADERSHIP = /(president|director|vp|secretary|lead|coordinator|admin)/i;

export const isSignedIn = (user) => Boolean(user);

export const isMemberUser = (user) => Boolean(user && (user.isMember || user.isLeadership || user.isAdmin));

export const isCommitteeUser = (user) =>
  Boolean(user && (user.isAdmin || user.isLeadership || LEADERSHIP.test(user.position || '')));

// Discipline Wing leadership and the President hold discipline clearance.
export const isDisciplineUser = (user) =>
  Boolean(
    user &&
      ((isCommitteeUser(user) && (user.wing || '').toLowerCase().includes('discipline wing')) ||
        /president/i.test(user.position || ''))
  );

export const homePortalFor = (user) => {
  if (isDisciplineUser(user)) return '/discipline';
  if (isCommitteeUser(user)) return '/committee';
  if (isMemberUser(user)) return '/member';
  return '/portal';
};

export const portalLabelFor = (user) => {
  if (isDisciplineUser(user)) return 'Discipline console';
  if (isCommitteeUser(user)) return 'Committee console';
  if (isMemberUser(user)) return 'Member dashboard';
  return 'Choose a portal';
};
