// Base URL del backend Spring Boot
// 10.0.2.2 es la IP del host desde el emulador Android
const BASE_URL = "http://10.0.2.2:8081/api";

// URL base del servidor (sin /api) para construir URLs de imágenes
export const IMAGE_BASE_URL = "http://10.0.2.2:8081";

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
        reject({ status: xhr.status, ...(data || {}) });
      }
    };

    xhr.onerror = () => {
      reject({ status: 0, message: "Error de red al subir archivos" });
    };

    xhr.send(formData);
  });
}
