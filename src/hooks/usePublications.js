import { useCallback, useEffect, useRef, useState } from 'react';
import { searchPublicationsApi } from '../services/publicationService';
import { saveSearchCacheOffline, getOfflineSearchCache } from '../storage/offlinePublicationsStorage';
import { getDatabaseSession, isCurrentSession } from '../database/session';

export function usePublications(searchCriteria = {}, enabled = true) {
  const [state, setState] = useState({ publications: [], loading: false, isOfflineMode: false, last: true, page: 0 });
  const requestNumber = useRef(0);
  const key = JSON.stringify(searchCriteria);
  const load = useCallback(async (page = 0) => {
    const request = ++requestNumber.current;
    const session = getDatabaseSession();
    const current = () => request === requestNumber.current && isCurrentSession(session);
    setState(prev => ({ ...prev, loading: true }));
    try {
      const criteria = JSON.parse(key);
      const result = await searchPublicationsApi({ ...criteria, type: criteria.type === 'LOST' ? 'FOUND' : 'LOST', page, size: 10 });
      if (!current()) return;
      const items = result.content || [];
      setState(prev => ({ publications: page ? [...prev.publications, ...items] : items, loading: false, isOfflineMode: false, last: result.last, page }));
      if (!page) await saveSearchCacheOffline(items, session);
    } catch (error) {
      if (!current()) return;
      if (!error.status || error.status >= 500) {
        const cached = await getOfflineSearchCache();
        if (current()) setState({ publications: cached?.items || [], loading: false, isOfflineMode: true, last: true, page: 0 });
      } else setState(prev => ({ ...prev, loading: false, error }));
    }
  }, [key]);
  useEffect(() => {
    if (enabled) load(0);
    return () => { requestNumber.current += 1; };
  }, [load, enabled]);
  return { ...state, refetch: () => load(0), loadMore: () => !state.last && !state.loading && !state.isOfflineMode && load(state.page + 1) };
}

