let badgeCount = 0;
const listeners = new Set();

const notify = () => {
  const active = badgeCount > 0;
  listeners.forEach((listener) => listener(active, badgeCount));
};

export const setProfileTabBadge = (value) => {
  if (typeof value === 'boolean') {
    badgeCount = value ? 1 : 0;
  } else if (typeof value === 'number') {
    badgeCount = Math.max(0, Math.floor(value));
  } else {
    badgeCount = 0;
  }
  notify();
};

export const incrementProfileTabBadge = (amount = 1) => {
  const delta = typeof amount === 'number' && amount > 0 ? Math.floor(amount) : 1;
  badgeCount += delta;
  notify();
  return badgeCount;
};

export const decrementProfileTabBadge = (amount = 1) => {
  const delta = typeof amount === 'number' && amount > 0 ? Math.floor(amount) : 1;
  badgeCount = Math.max(0, badgeCount - delta);
  notify();
  return badgeCount;
};

export const getProfileTabBadge = () => badgeCount > 0;
export const getProfileTabBadgeCount = () => badgeCount;

export const subscribeToProfileTabBadge = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
