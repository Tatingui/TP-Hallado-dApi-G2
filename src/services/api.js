import { clearSession } from '../storage/authStorage';
import { resetTo } from '../navigation/navigationRef';
import { API_URL } from '../constants/apiConfig';
import { getDatabaseSession, assertCurrentSession, isCurrentSession } from '../database/session';
import { readLocal, writeLocal } from '../database/localStore';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const IMAGE_BASE_URL = API_URL;
function capture(token) {
  if (!token) return null;
  const session = getDatabaseSession();
  if (session.token !== token) throw { status: 401, message: 'La sesión cambió.' };
  return session;
}
function check(session) { if (session) assertCurrentSession(session); }
async function expire(session) {
  if (!session || !isCurrentSession(session)) return;
  await clearSession();
  resetTo('Login');
}
async function invalidate(endpoint, session) {
  if (!session) return;
  const prefix = 'http:/' + endpoint.split('/')[1];
  await database.write(async () => {
    check(session);
    const rows = await database.get('cache_entries').query(Q.where('owner', session.owner), Q.where('cache_key', Q.like(Q.sanitizeLikeString(prefix) + '%'))).fetch();
    await database.batch(...rows.map(row => row.prepareDestroyPermanently()));
  });
}
async function request(method, endpoint, body, token) {
  const session = capture(token);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(API_URL + endpoint, {
      method, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    check(session);
    const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
    check(session);
    if (!response.ok) {
      if (response.status === 401) await expire(session);
      throw { status: response.status, message: data?.message || 'No se pudo completar la operación.', ...(data || {}) };
    }
    if (method !== 'GET') await invalidate(endpoint, session);
    return data;
  } catch (error) {
    if (error.status || error.code === 'SESSION_CHANGED') throw error;
    throw { status: 0, message: 'No se pudo conectar con el servidor. Revisá la conexión.', cause: error };
  } finally { clearTimeout(timeout); }
}
export async function apiGet(endpoint, token = null) {
  const session = capture(token);
  // Search/detail have their own photo-aware repositories and deletion handling.
  const cacheable = session && !endpoint.startsWith('/publications/search') && !/^\/publications\/\d+$/.test(endpoint) && !endpoint.startsWith('/auth/');
  let data;
  try { data = await request('GET', endpoint, undefined, token); }
  catch (error) {
    if (cacheable && (error.status === 0 || error.status >= 500)) {
      const cached = await readLocal('http:' + endpoint, null, session);
      if (cached) return { ...cached, __offline: true };
    }
    throw error;
  }
  if (cacheable && data) await writeLocal('http:' + endpoint, data, session);
  return data;
}
export const apiPost = (endpoint, body, token = null) => request('POST', endpoint, body, token);
export const apiPut = (endpoint, body, token = null) => request('PUT', endpoint, body, token);
export const apiPatch = (endpoint, body, token = null) => request('PATCH', endpoint, body, token);
export const apiDelete = (endpoint, token = null) => request('DELETE', endpoint, undefined, token);

export function apiPostMultipart(endpoint, formData, token = null, idempotencyKey = null) {
  const session = capture(token);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL + endpoint);
    if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    if (idempotencyKey) xhr.setRequestHeader('X-Idempotency-Key', idempotencyKey);
    xhr.timeout = 30000;
    xhr.onload = async () => {
      try {
        check(session);
        let data = null;
        try { data = JSON.parse(xhr.responseText); } catch { /* empty response */ }
        if (xhr.status >= 200 && xhr.status < 300) {
          await invalidate(endpoint, session);
          resolve(data);
        } else {
          if (xhr.status === 401) await expire(session);
          reject({ status: xhr.status, message: data?.message || 'El servidor rechazó la publicación. Revisá sus datos.', ...(data || {}) });
        }
      } catch (error) { reject(error); }
    };
    xhr.onerror = xhr.ontimeout = () => reject({ status: 0, message: 'Envío interrumpido; se reintentará con la misma clave.' });
    xhr.send(formData);
  });
}
