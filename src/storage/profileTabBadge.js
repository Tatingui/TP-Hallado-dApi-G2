let hasBadge = false;
const listeners = new Set();

export const setProfileTabBadge = (value) => {
  hasBadge = Boolean(value);
  listeners.forEach((listener) => listener(hasBadge));
};

export const getProfileTabBadge = () => hasBadge;

export const subscribeToProfileTabBadge = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
