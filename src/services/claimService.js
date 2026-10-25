import { apiGet, apiPut, apiPostMultipart, apiPost } from "./api";
import { getToken } from "../storage/authStorage";

// Punto 7: Enviar Reclamo con multipart (FormData)
export const createClaimApi = async (publicationId, proofMessage, verificationAnswer, imageUri) => {
  const formData = new FormData();
  const token = await getToken();

  const claimRequest = {
    proofMessage: proofMessage || "",
    verificationAnswer: verificationAnswer || ""
  };

  formData.append("claim", JSON.stringify(claimRequest));

  if (imageUri) {
    const filename = imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append("image", {
      uri: imageUri,
      name: filename,
      type
    });
  }

  // La API asume Token ya interceptado o se puede pasar manualmente,
  // pero usaremos apiPostMultipart que lo toma directo si tenes el token a mano.
  return apiPostMultipart(`/claims/${publicationId}`, formData, token);
};

// Modificada para recibir Token si se necesita explicito
export const createClaimApiWithToken = async (publicationId, proofMessage, verificationAnswer, imageUri, token) => {
  const formData = new FormData();

  const claimRequest = {
    proofMessage: proofMessage || "",
    verificationAnswer: verificationAnswer || ""
  };

  formData.append("claim", JSON.stringify(claimRequest));

  if (imageUri) {
    const filename = imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append("image", {
      uri: imageUri,
      name: filename,
      type
    });
  }

  return apiPostMultipart(`/claims/${publicationId}`, formData, token);
};

export const getMySentClaimsApi = async (page = 0, size = 10, tokenParam) => {
  const token = tokenParam || await getToken();
  return apiGet(`/claims/my-sent?page=${page}&size=${size}`, token);
};

export const getMyReceivedClaimsApi = async (page = 0, size = 10, tokenParam) => {
  const token = tokenParam || await getToken();
  return apiGet(`/claims/my-received?page=${page}&size=${size}`, token);
};

// Usa fetch PATCH con el auth manual o apiPut adaptada
export const respondToClaimApi = async (claimId, status, tokenParam) => {
  const token = tokenParam || await getToken();
  const BASE_URL = require("./api").IMAGE_BASE_URL + "/api";
  const response = await fetch(`${BASE_URL}/claims/${claimId}/respond`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok) {
    throw { status: response.status, ...(data || {}) };
  }
  return data;
};
