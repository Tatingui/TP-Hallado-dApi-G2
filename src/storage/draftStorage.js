import AsyncStorage from "@react-native-async-storage/async-storage";

const DRAFT_KEY = "hallado_publication_draft";

/**
 * Guarda un borrador de publicación en AsyncStorage.
 * Se persiste entre cierres de app para que el usuario
 * no pierda su progreso si sale del flujo.
 *
 * @param {Object} draft - Estado parcial del formulario
 */
export async function saveDraft(draft) {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.warn("Error guardando borrador:", e);
  }
}

/**
 * Recupera el borrador guardado, si existe.
 * @returns {Object|null}
 */
export async function loadDraft() {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Error cargando borrador:", e);
    return null;
  }
}

/**
 * Elimina el borrador (se llama al publicar con éxito).
 */
export async function clearDraft() {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.warn("Error eliminando borrador:", e);
  }
}
