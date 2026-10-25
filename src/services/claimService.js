import { apiGet, apiPostMultipart } from "./api";
import { getToken } from "../storage/authStorage";

/**
 * Crea un nuevo reclamo ("Es mío" / "Lo encontré") enviando los datos en FormData multipart.
 */
export const createClaimApi = async (publicationId, proofMessage, verificationAnswer, imageUri, tokenParam) => {
  const formData = new FormData();
  const token = tokenParam || (await getToken());

  const claimRequest = {
    proofMessage: proofMessage || "",
    verificationAnswer: verificationAnswer || "",
  };

  formData.append("claim", JSON.stringify(claimRequest));

  if (imageUri) {
    const filename = imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image";

    formData.append("image", {
      uri: imageUri,
      name: filename,
      type,
    });
  }

  return apiPostMultipart(`/claims/${publicationId}`, formData, token);
};

/**
 * Obtiene las publicaciones donde el usuario realizó un reclamo (Enviados).
 */
export const getMySentClaimsApi = async (page = 0, size = 10, tokenParam) => {
  const token = tokenParam || (await getToken());
  return apiGet(`/claims/my-sent?page=${page}&size=${size}`, token);
};

/**
 * Obtiene los reclamos recibidos en publicaciones del usuario (Recibidos).
 */
export const getMyReceivedClaimsApi = async (page = 0, size = 10, tokenParam) => {
  const token = tokenParam || (await getToken());
  return apiGet(`/claims/my-received?page=${page}&size=${size}`, token);
};

/**
 * Responde a un reclamo (ACCEPT / REJECT) actualizando su estado.
 */
export const respondToClaimApi = async (claimId, status, tokenParam) => {
  const token = tokenParam || (await getToken());
  const BASE_URL = require("./api").IMAGE_BASE_URL + "/api";
  const response = await fetch(`${BASE_URL}/claims/${claimId}/respond`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw { status: response.status, ...(data || {}) };
  }
  return data;
};
