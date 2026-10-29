import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { PublicationType } from "../constants/publicationConstants";
import { useAuth } from "./useAuth";
import { createPublicationApi } from "../services/publicationService";
import { clearDraft, loadDraft, saveDraft } from "../storage/draftStorage";
import { savePendingPublication } from "../storage/pendingSyncStorage";

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
  const router = useRouter();
  const { token } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [touched, setTouched] = useState({});

  const markTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Cargar borrador al montar
  useEffect(() => {
    (async () => {
      const draft = await loadDraft();
      if (draft && (draft.title || draft.type || draft.category)) {
        setHasDraft(true);
        Alert.alert(
          "Borrador encontrado",
          "Tenés una publicación sin terminar. ¿Querés continuar?",
          [
            {
              text: "Descartar",
              style: "destructive",
              onPress: () => {
                clearDraft();
                setHasDraft(false);
              },
            },
            {
              text: "Continuar",
              onPress: () => {
                setForm({ ...INITIAL_FORM, ...draft });
                setHasDraft(false);
              },
            },
          ],
        );
      }
    })();
  }, []);

  // Auto-guardar borrador cuando cambia el form
  useEffect(() => {
    if (form.type || form.title) {
      saveDraft(form);
    }
  }, [form]);

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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tu galería para agregar fotos.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 4 - form.images.length,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((a) => ({
        uri: a.uri,
        type: a.mimeType || "image/jpeg",
        fileName: a.fileName || `img_${Date.now()}.jpg`,
      }));
      updateField("images", [...form.images, ...newImages].slice(0, 4));
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
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu ubicación.");
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      updateField("latitude", loc.coords.latitude);
      updateField("longitude", loc.coords.longitude);
      Alert.alert("Ubicación obtenida", "Se registró tu ubicación actual.");
    } catch {
      Alert.alert("Error", "No se pudo obtener la ubicación.");
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
      eventDate: form.eventDate || new Date().toISOString(),
    };
    if (form.type === PublicationType.FOUND) {
      payload.verificationQuestion = form.verificationQuestion.trim() || null;
      payload.verificationAnswer = form.verificationAnswer.trim() || null;
    }

    try {
      await createPublicationApi(payload, form.images);
      await clearDraft();
      Alert.alert(
        "¡Publicación creada!",
        "Tu publicación fue creada con éxito.",
        [
          {
            text: "Ver mis publicaciones",
            onPress: () => router.replace("/(tabs)/my-publications"),
          },
          { text: "OK" },
        ],
      );
      setForm(INITIAL_FORM);
      setTouched({});
      setStep(0);
    } catch (err) {
      console.warn("Fallo en envío de publicación, intentando guardado offline...", err);
      try {
        await savePendingPublication(payload, form.images);
        await clearDraft();
        Alert.alert(
          "Publicación guardada (Modo Sin Conexión)",
          "No tenés conexión a internet en este momento. La publicación quedó marcada como 'Pendiente de envío' y se subirá automáticamente cuando recuperes la red.",
          [
            {
              text: "Ver mis publicaciones",
              onPress: () => router.replace("/(tabs)/my-publications"),
            },
            { text: "Entendido" },
          ],
        );
        setForm(INITIAL_FORM);
        setTouched({});
        setStep(0);
      } catch (saveError) {
        Alert.alert(
          "Error",
          err?.message || "No se pudo crear ni guardar la publicación.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Errores de validación por campo ───
  function fieldError(field) {
    if (!touched[field]) return null;
    switch (field) {
      case "title":
        if (form.title.trim().length === 0) return "El título es obligatorio.";
        if (form.title.trim().length < 5) return "Mínimo 5 caracteres.";
        return null;
      case "description":
        if (form.description.trim().length === 0)
          return "La descripción es obligatoria.";
        if (form.description.trim().length < 10) return "Mínimo 10 caracteres.";
        return null;
      case "verificationQuestion":
        if (form.verificationQuestion.trim().length === 0)
          return "La pregunta de verificación es obligatoria.";
        return null;
      case "verificationAnswer":
        if (form.verificationAnswer.trim().length === 0)
          return "La respuesta es obligatoria.";
        return null;
      default:
        return null;
    }
  }

  // ─── Validación por paso ───
  const canAdvance = () => {
    switch (STEPS[step]) {
      case "type":
        return form.type !== null;
      case "category":
        return form.category !== null;
      case "details": {
        const hasBasicDetails =
          form.title.trim().length >= 5 && form.description.trim().length >= 10;
        const hasVerificationData =
          form.type !== PublicationType.FOUND ||
          (form.verificationQuestion.trim().length > 0 &&
            form.verificationAnswer.trim().length > 0);
        return hasBasicDetails && hasVerificationData;
      }
      case "location":
        return form.barrio !== null;
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
    showDatePicker,
    setShowDatePicker,
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
