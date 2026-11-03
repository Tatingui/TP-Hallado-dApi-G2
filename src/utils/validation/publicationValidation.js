import { PublicationType } from "../../constants/publicationConstants";

export function validatePublicationDetails(form) {
  const safeForm = form || {};
  const errors = {};
  const title = safeForm.title?.trim() || "";
  const description = safeForm.description?.trim() || "";

  if (title.length === 0) {
    errors.title = "El título es obligatorio.";
  } else if (title.length < 5) {
    errors.title = "Mínimo 5 caracteres.";
  } else if (title.length > 100) {
    errors.title = "Máximo 100 caracteres.";
  }

  if (description.length === 0) {
    errors.description = "La descripción es obligatoria.";
  } else if (description.length < 10) {
    errors.description = "Mínimo 10 caracteres.";
  } else if (description.length > 1000) {
    errors.description = "Máximo 1000 caracteres.";
  }

  if (safeForm.type === PublicationType.FOUND) {
    if (!(safeForm.verificationQuestion?.trim() || "")) {
      errors.verificationQuestion = "La pregunta de verificación es obligatoria.";
    }
    if (!(safeForm.verificationAnswer?.trim() || "")) {
      errors.verificationAnswer = "La respuesta es obligatoria.";
    }
  }

  return errors;
}

export function validatePublication(form) {
  const safeForm = form || {};
  const errors = validatePublicationDetails(safeForm);
  if (!(safeForm.barrio?.trim() || "")) {
    errors.barrio = "Seleccioná un barrio.";
  }
  return errors;
}

export function hasValidationErrors(errors) {
  return Boolean(errors && Object.keys(errors).length > 0);
}
