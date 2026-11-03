import { authGet, authPatch, authPost, authPostMultipart, authPut } from "./api";

/**
 * Crea un nuevo reclamo ("Es mío" / "Lo encontré") enviando los datos en FormData multipart.
 * En "Lo encontré" se envía además el barrio donde se encontró el objeto.
 */
export const createClaimApi = async (publicationId, proofMessage, verificationAnswer, imageUri, barrio, tokenParam) => {
  const formData = new FormData();

  const claimRequest = {
    proofMessage: proofMessage || "",
    verificationAnswer: verificationAnswer || "",
    barrio: barrio || null,
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

  return authPostMultipart(`/claims/${publicationId}`, formData, tokenParam);
};

/**
 * Obtiene las publicaciones donde el usuario realizó un reclamo (Enviados).
 */
export const getMySentClaimsApi = async (page = 0, size = 10, tokenParam) => {
  return authGet(`/claims/my-sent?page=${page}&size=${size}`, tokenParam);
};

/**
 * Obtiene los reclamos recibidos en publicaciones del usuario (Recibidos).
 */
export const getMyReceivedClaimsApi = async (page = 0, size = 10, tokenParam) => {
  return authGet(`/claims/my-received?page=${page}&size=${size}`, tokenParam);
};

/**
 * Responde a un reclamo (ACCEPT / REJECT) actualizando su estado.
 */
export const respondToClaimApi = async (claimId, status, tokenParam) => {
  return authPatch(`/claims/${claimId}/respond`, { status }, tokenParam);
};

/**
 * Punto 8: Propone un punto de encuentro o sugiere uno alternativo.
 */
export const proposeMeetingPointApi = async (claimId, address, tokenParam) => {
  return authPut(`/claims/${claimId}/meeting-point`, { address }, tokenParam);
};

/**
 * Punto 8: Acepta el punto de encuentro propuesto por la otra parte.
 */
export const acceptMeetingPointApi = async (claimId, tokenParam) => {
  return authPost(`/claims/${claimId}/meeting-point/accept`, {}, tokenParam);
};

/**
 * Ciclo de vida: el publicador confirma que el objeto se entregó (la publicación queda resuelta).
 */
export const confirmDeliveryApi = async (claimId, tokenParam) => {
  return authPost(`/claims/${claimId}/deliver`, {}, tokenParam);
};

/**
 * Ciclo de vida: el publicador cancela un reclamo aceptado.
 * Con republish vuelve a abrir la publicación; sin republish la elimina.
 */
export const cancelClaimApi = async (claimId, republish, tokenParam) => {
  return authPost(`/claims/${claimId}/cancel`, { republish }, tokenParam);
};

export const getResolvedHistoryApi = async (filters = {}, tokenParam) => {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.type && filters.type !== "ALL") params.append("type", filters.type);
  return authGet(`/claims/resolved-history?${params.toString()}`, tokenParam);
};

export const rateResolvedCaseApi = async (claimId, rating, tokenParam) => {
  return authPost(`/claims/${claimId}/rating`, rating, tokenParam);
};
