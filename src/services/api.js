import { clearSession } from '../storage/authStorage';
import { router } from 'expo-router';

import Constants from 'expo-constants';

// Obtiene dinámicamente la IP de la PC en la red local cuando se ejecuta desde un celular físico con Expo Go
function getHostIp() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.developer?.tool;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '10.0.2.2'; // Fallback para emulador de Android Studio
}

const HOST_IP = getHostIp();

// Base URL del backend Spring Boot
const BASE_URL = `http://${HOST_IP}:8081/api`;

// URL base del servidor (sin /api) para construir URLs de imágenes
export const IMAGE_BASE_URL = `http://${HOST_IP}:8081/api`;

/**
 * Maneja token expirado o inválido: limpia la sesión y redirige al login.
 * Se invoca automáticamente cuando el backend responde 401 o 403.
 */
let _isRedirecting = false;
async function handleSessionExpired() {
  if (_isRedirecting) return; // Evitar múltiples redirecciones simultáneas
  _isRedirecting = true;
  try {
    await clearSession();
    router.replace("/(auth)/login");
  } catch (e) {
    console.error("Error cerrando sesión expirada:", e);
  } finally {
    setTimeout(() => { _isRedirecting = false; }, 2000);
  }
}

/**
 * Realiza un POST al backend.
 * Equivalente a ApiClient + Retrofit en la app Android de Ronda.
 */
export async function apiPost(endpoint, body, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type");
  const data = contentType && contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      await handleSessionExpired();
    }
    throw { status: response.status, ...(data || {}) };
  }

  return data;
}

/**
 * Realiza un GET al backend.
 */
export async function apiGet(endpoint, token = null) {
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers,
  });

  const contentType = response.headers.get("content-type");
  const data = contentType && contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      await handleSessionExpired();
    }
    throw { status: response.status, ...(data || {}) };
  }

  return data;
}

/**
 * Realiza un DELETE al backend.
 */
export async function apiDelete(endpoint, token = null) {
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers,
  });

  const contentType = response.headers.get("content-type");
  const data = contentType && contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      await handleSessionExpired();
    }
    throw { status: response.status, ...(data || {}) };
  }

  return data;
}

/**
 * Realiza un PUT al backend.
 */
export async function apiPut(endpoint, body, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type");
  const data = contentType && contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      await handleSessionExpired();
    }
    throw { status: response.status, ...(data || {}) };
  }

  return data;
}

/**
 * Realiza un POST multipart/form-data al backend.
 * Usa XMLHttpRequest en lugar de fetch para mejor compatibilidad
 * con uploads de archivos en React Native.
 */
export function apiPostMultipart(endpoint, formData, token = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}${endpoint}`);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    // No setear Content-Type — XMLHttpRequest lo pone con el boundary

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch (e) {
        // respuesta no es JSON
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        (xhr.status === 401 || xhr.status === 403) && handleSessionExpired();
        reject({ status: xhr.status, ...(data || {}) });
      }
    };

    xhr.onerror = () => {
      reject({ status: 0, message: "Error de red al subir archivos" });
    };

    xhr.send(formData);
  });
}
