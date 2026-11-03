import { PublicationType } from "../../constants/publicationConstants";

export function validatePublicationDetails(form) {
  const errors = {};
  const title = form.title?.trim() || "";
  const description = form.description?.trim() || "";

  if (title.length === 0) {
    errors.title = "El título es obligatorio.";
  } else if (title.length < 5) {
    errors.title = "Mínimo 5 caracteres.";
  }

  if (description.length === 0) {
    errors.description = "La descripción es obligatoria.";
  } else if (description.length < 10) {
    errors.description = "Mínimo 10 caracteres.";
  }

  if (form.type === PublicationType.FOUND) {
    if (!(form.verificationQuestion?.trim() || "")) {
      errors.verificationQuestion = "La pregunta de verificación es obligatoria.";
    }
    if (!(form.verificationAnswer?.trim() || "")) {
      errors.verificationAnswer = "La respuesta es obligatoria.";
    }
  }

  return errors;
}

export function validatePublication(form) {
  const errors = validatePublicationDetails(form);
  if (!(form.barrio?.trim() || "")) {
    errors.barrio = "Seleccioná un barrio.";
  }
  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
