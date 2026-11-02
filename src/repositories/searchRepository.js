import { readLocal, updateLocal } from '../database/localStore';
export const getLocalRecentSearches = () => readLocal('recent_searches', []);
export const saveLocalRecentSearch = data => updateLocal('recent_searches', rows => [data, ...rows.filter(row => JSON.stringify(row) !== JSON.stringify(data))].slice(0, 5), []);
