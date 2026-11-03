import { readLocal, writeLocal } from '../database/localStore';

export const DEFAULT_DRAFT = {
  title: '',
  description: '',
  barrio: '',
  category: '',
  type: 'LOST',
  images: [],
};

export const sanitizeDraft = (draft) => {
  if (!draft || typeof draft !== 'object') return { ...DEFAULT_DRAFT };
  return {
    ...DEFAULT_DRAFT,
    ...draft,
    title: typeof draft.title === 'string' ? draft.title : '',
    description: typeof draft.description === 'string' ? draft.description : '',
    barrio: typeof draft.barrio === 'string' ? draft.barrio : '',
    category: typeof draft.category === 'string' ? draft.category : '',
    type: typeof draft.type === 'string' ? draft.type : 'LOST',
    images: Array.isArray(draft.images) ? draft.images : [],
  };
};

export const loadDraft = async () => {
  const raw = await readLocal('draft', null);
  return raw ? sanitizeDraft(raw) : null;
};

export const saveDraft = (draft) => writeLocal('draft', sanitizeDraft(draft));
export const clearDraft = () => writeLocal('draft', null);
