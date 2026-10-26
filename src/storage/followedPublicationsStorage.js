const FOLLOWED_PUBLICATIONS_KEY = '@hallado_followed_publications_v1';
const inMemoryStore = {};

const getFallbackStorage = () => ({
  getItem: async (key) => inMemoryStore[key] ?? null,
  setItem: async (key, value) => {
    inMemoryStore[key] = String(value);
  },
  removeItem: async (key) => {
    delete inMemoryStore[key];
  },
});

const getStorage = () => {
  const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
  if (!isReactNative) {
    return getFallbackStorage();
  }

  try {
    const storageModule = require('@react-native-async-storage/async-storage');
    const storage = storageModule && (storageModule.default || storageModule);
    if (storage && typeof storage.getItem === 'function') {
      return storage;
    }
  } catch (error) {
    // Ignored: fallback storage is used when the mobile runtime is unavailable.
  }

  return getFallbackStorage();
};

const getFollowedPublications = async (userKey = 'guest') => {
  try {
    const storage = getStorage();
    const raw = await storage.getItem(FOLLOWED_PUBLICATIONS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    const userPublications = parsed[String(userKey || 'guest')] || [];
    return Array.isArray(userPublications) ? userPublications.map(String) : [];
  } catch (error) {
    console.error('Error leyendo publicaciones seguidas:', error);
    return [];
  }
};

const isPublicationFollowed = async (userKey = 'guest', publicationId) => {
  const followedPublications = await getFollowedPublications(userKey);
  return followedPublications.includes(String(publicationId));
};

const toggleFollowPublication = async (userKey = 'guest', publicationId) => {
  try {
    const storage = getStorage();
    const normalizedUser = String(userKey || 'guest');
    const normalizedPublicationId = String(publicationId);

    const raw = await storage.getItem(FOLLOWED_PUBLICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const current = Array.isArray(parsed[normalizedUser]) ? parsed[normalizedUser].map(String) : [];
    const isFollowed = current.includes(normalizedPublicationId);

    const next = isFollowed
      ? current.filter((id) => id !== normalizedPublicationId)
      : [...current, normalizedPublicationId];

    parsed[normalizedUser] = next;
    await storage.setItem(FOLLOWED_PUBLICATIONS_KEY, JSON.stringify(parsed));

    return !isFollowed;
  } catch (error) {
    console.error('Error actualizando publicación seguida:', error);
    return false;
  }
};

module.exports = {
  getFollowedPublications,
  isPublicationFollowed,
  toggleFollowPublication,
};
