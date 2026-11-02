import * as FileSystem from 'expo-file-system/legacy';
import { randomUUID } from 'expo-crypto';
import { getDatabaseSession, assertCurrentSession } from '../../database/session';
import { API_URL } from '../../constants/apiConfig';

export async function saveImageToOfflineStorage(uri, session = getDatabaseSession()) {
  if (!uri) throw new Error('La imagen no tiene una ubicación válida.');
  const directory = FileSystem.documentDirectory + 'offline_images/' + encodeURIComponent(session.owner) + '/';
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const remote = /^https?:/.test(uri) || uri.startsWith('/');
  const source = uri.startsWith('/') ? API_URL + uri : uri;
  if (!remote) {
    const info = await FileSystem.getInfoAsync(source);
    if (!info.exists) throw new Error('Una foto ya no está disponible. Volvé a seleccionarla.');
    if (source.startsWith(directory)) return source;
  }
  const extension = source.split('?')[0].match(/\.(jpg|jpeg|png|webp|heic)$/i)?.[1] || 'jpg';
  const destination = directory + randomUUID() + '.' + extension;
  try {
    if (remote) {
      const result = await FileSystem.downloadAsync(source, destination);
      if (result.status !== 200) throw new Error('No se pudo descargar la foto.');
    } else await FileSystem.copyAsync({ from: source, to: destination });
    assertCurrentSession(session);
    return destination;
  } catch (error) {
    await FileSystem.deleteAsync(destination, { idempotent: true }).catch(() => {});
    throw error;
  }
}
export async function persistImages(images = [], session = getDatabaseSession()) {
  return Promise.all(images.map(async image => ({
    ...(typeof image === 'string' ? {} : image),
    uri: await saveImageToOfflineStorage(typeof image === 'string' ? image : image.uri, session),
  })));
}
export async function cachePublicationImages(publication, session = getDatabaseSession()) {
  const urls = publication.imageUrls || publication.images || [];
  const images = await Promise.all(urls.map(async value => {
    const uri = typeof value === 'string' ? value : value.uri;
    try { return await saveImageToOfflineStorage(uri, session); }
    catch (error) { assertCurrentSession(session); return null; }
  }));
  return { ...publication, imageUrls: images.filter(Boolean), offlineImagesMissing: images.some(uri => !uri) };
}

