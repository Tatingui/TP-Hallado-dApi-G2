import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { PublicationType } from "../constants/publicationConstants";
import {
  getPublicationForEditApi,
  updatePublicationApi,
} from "../services/publicationService";
import { toLocalDateTimeString } from "../utils/date";
import useLocation from "./useLocation";
import { validatePublication } from "../utils/validation/publicationValidation";

/**
 * Hook que encapsula la edición de una publicación: carga del formulario,
 * actualización de campos, ubicación GPS actual, validación y guardado.
 */
export default function useEditPublication(id) {
  const navigation = useNavigation();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { loading: loadingLocation, getLocation } = useLocation();

  useEffect(() => {
    getPublicationForEditApi(id)
      .then((publication) =>
        setForm({
          ...publication,
          eventDate: publication.eventDate || toLocalDateTimeString(new Date()),
          verificationQuestion: publication.verificationQuestion || "",
          verificationAnswer: publication.verificationAnswer || "",
          address: publication.address || "",
        }),
      )
      .catch(() => Alert.alert("Error", "No se pudo cargar la publicación."))
      .finally(() => setLoading(false));
  }, [id]);

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleUseCurrentLocation = async () => {
    if (loadingLocation) return;
    try {
      const location = await getLocation();
      if (!location) {
        Alert.alert("Permiso necesario", "Necesitamos acceso a tu ubicación.");
        return;
      }
      setForm((current) => ({
        ...current,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
      Alert.alert("Ubicación obtenida", "Se registró tu ubicación actual.");
    } catch (error) {
      Alert.alert(
        "Error",
        error?.message || "No se pudo obtener la ubicación.",
      );
    }
  };

  const save = async () => {
    const questionRequired = form.type === PublicationType.FOUND;
    const errors = validatePublication(form);
    if (errors.title || errors.description) {
      Alert.alert(
        "Datos incompletos",
        "El título debe tener 5 caracteres y la descripción 10 como mínimo.",
      );
      return;
    }
    if (errors.barrio) {
      Alert.alert("Datos incompletos", "Seleccioná un barrio.");
      return;
    }
    if (questionRequired && (errors.verificationQuestion || errors.verificationAnswer)) {
      Alert.alert(
        "Datos incompletos",
        "La pregunta y la respuesta de verificación son obligatorias.",
      );
      return;
    }
    setSaving(true);
    try {
      await updatePublicationApi(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        verificationQuestion: questionRequired
          ? form.verificationQuestion.trim()
          : null,
        verificationAnswer: questionRequired
          ? form.verificationAnswer.trim()
          : null,
        eventDate: form.eventDate,
        barrio: form.barrio,
        address: form.address.trim() || null,
        latitude: form.latitude,
        longitude: form.longitude,
      });
      Alert.alert(
        "Publicación actualizada",
        "Los cambios se guardaron correctamente.",
        [{ text: "OK", onPress: () => navigation.replace("PublicationDetail", { id }) }],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error?.message || "No se pudo actualizar la publicación.",
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    loading,
    saving,
    loadingLocation,
    updateField,
    handleUseCurrentLocation,
    save,
  };
}
