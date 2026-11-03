import { randomUUID } from 'expo-crypto';
import { triggerSyncProcess } from '../sync/syncCoordinator';
import { persistImages } from '../services/files/fileSystemManager';
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { PublicationType } from "../constants/publicationConstants";
import { clearDraft, loadDraft, saveDraft } from "../storage/draftStorage";
import { savePendingPublication, removePendingPublication } from "../storage/pendingSyncStorage";
import { toLocalDateTimeString } from "../utils/date";
import useLocation from "./useLocation";
import useImagePicker from "./useImagePicker";
import {
  hasValidationErrors,
  validatePublicationDetails,
} from "../utils/validation/publicationValidation";

const STEPS = ["type", "category", "details", "location", "images", "review"];

const INITIAL_FORM = {
  type: null,
  category: null,
  title: "",
  description: "",
  barrio: null,
  address: "",
  latitude: null,
  longitude: null,
  eventDate: null,
  verificationQuestion: "",
  verificationAnswer: "",
  images: [],
};

export default function usePublishForm() {
  const navigation = useNavigation();
  const route = useRoute();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM, operationKey: randomUUID() }));
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const { getLocation: readLocation } = useLocation();
  const { pickImages: pickImagesFromGallery } = useImagePicker();

  const markTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Cargar borrador al montar
  useEffect(() => {
    (async () => {
      if (route.params?.pendingDraft) return;
      const draft = await loadDraft();
      if (draft && (draft.title || draft.type || draft.category)) {
        Alert.alert(
          "Borrador encontrado",
          "Tenés una publicación sin terminar. ¿Querés continuar?",
          [
            {
              text: "Descartar",
              style: "destructive",
              onPress: () => {
                clearDraft();
              },
            },
            {
              text: "Continuar",
              onPress: () => {
                setForm({ ...INITIAL_FORM, operationKey: randomUUID(), ...draft });
                setStep(draft.currentStep || 0);
                if (draft.recoveryWarning) Alert.alert("Revisá las fotos", draft.recoveryWarning);
              },
            },
          ],
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (route.params?.pendingDraft) {
      setForm({ ...INITIAL_FORM, ...route.params.pendingDraft, operationKey: randomUUID() });
      setStep(2);
    }
  }, [route.params?.pendingDraft]);

  // Auto-guardar borrador cuando cambia el form
  useEffect(() => {
    if (form.type || form.title) {
      saveDraft({ ...form, currentStep: step }).catch(error => Alert.alert("No se pudo guardar el borrador", error.message));
    }
  }, [form, step]);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  // ─── Seleccionar imágenes ───
  const pickImages = async () => {
    try {
      const newImages = await pickImagesFromGallery(4 - form.images.length);
      if (newImages === null) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tu galería para agregar fotos.",
        );
        return;
      }
      if (newImages.length > 0) {
        const durable = await persistImages(newImages);
        updateField("images", [...form.images, ...durable].slice(0, 4));
      }
    } catch (error) {
      Alert.alert("No se pudieron guardar las fotos", error.message);
    }
  };

  const removeImage = (index) => {
    updateField(
      "images",
      form.images.filter((_, i) => i !== index),
    );
  };

  // ─── Obtener ubicación GPS ───
  const getLocation = async () => {
    try {
      const location = await readLocation();
      if (!location) {
        Alert.alert("Permiso necesario", "Necesitamos acceso a tu ubicación.");
        return;
      }
      updateField("latitude", location.latitude);
      updateField("longitude", location.longitude);
      Alert.alert("Ubicación obtenida", "Se registró tu ubicación actual.");
    } catch (error) {
      Alert.alert("Error", error?.message || "No se pudo obtener la ubicación.");
    }
  };

  // ─── Enviar publicación ───
  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      category: form.category,
      barrio: form.barrio,
      address: form.address.trim() || null,
      latitude: form.latitude,
      longitude: form.longitude,
      eventDate: form.eventDate || toLocalDateTimeString(new Date()),
    };
    if (form.type === PublicationType.FOUND) {
      payload.verificationQuestion = form.verificationQuestion.trim() || null;
      payload.verificationAnswer = form.verificationAnswer.trim() || null;
    }

    try {
      await savePendingPublication(payload, form.images, { idempotencyKey: form.operationKey });
      if (route.params?.pendingId) {
        await removePendingPublication(route.params.pendingId);
        navigation.setParams({pendingId: undefined, pendingDraft: undefined});
      }
      await clearDraft();
      triggerSyncProcess().catch((error) => console.warn("No se pudo sincronizar:", error.message));
      setForm({ ...INITIAL_FORM, operationKey: randomUUID() });
      setTouched({});
      setStep(0);
      Alert.alert('Publicación guardada', 'Se enviará automáticamente cuando haya conexión. Podés consultar el estado en Mis publicaciones.', [{text:'Ver mis publicaciones', onPress:()=>navigation.navigate('MyPublicationsTab')}]);
    } catch (error) {
      Alert.alert('No se pudo guardar', error.message);
    } finally { setSubmitting(false); }
  };

  // ─── Errores de validación por campo ───
  function fieldError(field) {
    if (!touched[field]) return null;
    return validatePublicationDetails(form)[field] || null;
  }

  // ─── Validación por paso ───
  const canAdvance = () => {
    switch (STEPS[step]) {
      case "type":
        return form.type !== null;
      case "category":
        return form.category !== null;
      case "details": {
        return !hasValidationErrors(validatePublicationDetails(form));
      }
      case "location":
        return Boolean(form.barrio?.trim());
      case "images":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  };

  return {
    STEPS,
    step,
    form,
    submitting,
    updateField,
    markTouched,
    fieldError,
    canAdvance,
    nextStep,
    prevStep,
    pickImages,
    removeImage,
    getLocation,
    handleSubmit,
  };
}
