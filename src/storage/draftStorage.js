import { readLocal, writeLocal } from '../database/localStore';
export const loadDraft = () => readLocal('draft');
export const saveDraft = draft => writeLocal('draft', draft);
export const clearDraft = () => writeLocal('draft', null);

