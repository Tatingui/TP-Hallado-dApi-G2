import * as FileSystem from 'expo-file-system';

const OFFLINE_IMAGES_DIR = `${FileSystem.documentDirectory}offline_images/`;

export const ensureOfflineDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(OFFLINE_IMAGES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(OFFLINE_IMAGES_DIR, { intermediates: true });
  }
};

export const saveImageToOfflineStorage = async (uri) => {
  try {
    await ensureOfflineDirExists();
    const filename = uri.split('/').pop();
    const newPath = `${OFFLINE_IMAGES_DIR}${Date.now()}_${filename}`;

    await FileSystem.copyAsync({
      from: uri,
      to: newPath,
    });

    return newPath;
  } catch (error) {
    console.error('Error saving image offline:', error);
    return uri; // Fallback to original URI
  }
};
