// Base URL del backend Spring Boot
// 10.0.2.2 es la IP del host desde el emulador Android
const BASE_URL = "http://10.0.2.2:8081/api";

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
 * Usado para subir imágenes junto con datos.
 */
export async function apiPostMultipart(endpoint, formData, token = null) {
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // No setear Content-Type — fetch lo pone automáticamente con el boundary

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
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
