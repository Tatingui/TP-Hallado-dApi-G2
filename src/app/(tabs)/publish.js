import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import {
  PublicationType,
  CATEGORY_OPTIONS,
  BARRIOS_LIST,
  getTypeLabel,
} from "../../constants/publicationConstants";
import { createPublicationApi } from "../../services/publicationService";
import { saveDraft, loadDraft, clearDraft } from "../../storage/draftStorage";
import DateTimePicker from "@react-native-community/datetimepicker";

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

export default function PublishScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
          ]
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
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería para agregar fotos.");
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
      form.images.filter((_, i) => i !== index)
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
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
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
    try {
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
      await createPublicationApi(payload, form.images);
      await clearDraft();
      Alert.alert("¡Publicación creada!", "Tu publicación fue creada con éxito.", [
        { text: "Ver mis publicaciones", onPress: () => router.replace("/(tabs)/my-publications") },
        { text: "OK" },
      ]);
      setForm(INITIAL_FORM);
      setStep(0);
    } catch (err) {
      Alert.alert("Error", err?.message || "No se pudo crear la publicación. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Validación por paso ───
  const canAdvance = () => {
    switch (STEPS[step]) {
      case "type":
        return form.type !== null;
      case "category":
        return form.category !== null;
      case "details":
        return form.title.trim().length >= 5 && form.description.trim().length >= 10;
      case "location":
        return form.barrio !== null;
      case "images":
        return true; // Imágenes opcionales
      case "review":
        return true;
      default:
        return false;
    }
  };

  // ─── Render por paso ───
  const renderStep = () => {
    switch (STEPS[step]) {
      case "type":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>¿Qué querés publicar?</Text>
            <Text style={styles.stepSubtitle}>Seleccioná el tipo de publicación</Text>
            {[PublicationType.LOST, PublicationType.FOUND].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.optionCard, form.type === t && styles.optionCardSelected]}
                onPress={() => updateField("type", t)}
              >
                <Ionicons
                  name={t === PublicationType.LOST ? "search-outline" : "eye-outline"}
                  size={28}
                  color={form.type === t ? Colors.surface : Colors.primary}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text
                    style={[styles.optionTitle, form.type === t && styles.optionTitleSelected]}
                  >
                    {getTypeLabel(t)}
                  </Text>
                  <Text style={[styles.optionDesc, form.type === t && styles.optionDescSelected]}>
                    {t === PublicationType.LOST
                      ? "Perdiste algo y querés encontrarlo"
                      : "Encontraste algo y querés devolverlo"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case "category":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Categoría</Text>
            <Text style={styles.stepSubtitle}>¿Qué tipo de objeto es?</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, form.category === cat.id && styles.categoryCardSelected]}
                  onPress={() => updateField("category", cat.id)}
                >
                  <Ionicons
                    name={
                      cat.icon === "paw" ? "paw-outline" :
                      cat.icon === "key" ? "key-outline" :
                      cat.icon === "card-account-details" ? "card-outline" :
                      cat.icon === "cellphone" ? "phone-portrait-outline" :
                      cat.icon === "tshirt-crew" ? "shirt-outline" :
                      "ellipsis-horizontal-circle-outline"
                    }
                    size={28}
                    color={form.category === cat.id ? Colors.surface : Colors.primary}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      form.category === cat.id && styles.categoryLabelSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "details":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Detalles</Text>
            <Text style={styles.stepSubtitle}>Describí lo que perdiste o encontraste</Text>
            <Text style={styles.inputLabel}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Perro labrador negro con collar rojo"
              placeholderTextColor={Colors.textSecondary}
              value={form.title}
              onChangeText={(v) => updateField("title", v)}
              maxLength={100}
            />
            <Text style={styles.charCount}>{form.title.length}/100</Text>

            <Text style={styles.inputLabel}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detallá características, color, tamaño, dónde y cuándo fue..."
              placeholderTextColor={Colors.textSecondary}
              value={form.description}
              onChangeText={(v) => updateField("description", v)}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{form.description.length}/500</Text>

            {form.type === PublicationType.FOUND && (
              <>
                <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                  Pregunta de verificación (opcional)
                </Text>
                <Text style={styles.helperText}>
                  Una pregunta que solo el dueño real podría responder
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: ¿Qué dice la chapita del collar?"
                  placeholderTextColor={Colors.textSecondary}
                  value={form.verificationQuestion}
                  onChangeText={(v) => updateField("verificationQuestion", v)}
                  maxLength={200}
                />
                <Text style={styles.inputLabel}>Respuesta esperada</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Luna"
                  placeholderTextColor={Colors.textSecondary}
                  value={form.verificationAnswer}
                  onChangeText={(v) => updateField("verificationAnswer", v)}
                  maxLength={200}
                />
              </>
            )}
          </View>
        );

      case "location":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Ubicación</Text>
            <Text style={styles.stepSubtitle}>
              ¿Dónde {form.type === PublicationType.LOST ? "lo perdiste" : "lo encontraste"}?
            </Text>

            <Text style={styles.inputLabel}>Barrio *</Text>
            <View style={styles.barrioGrid}>
              {BARRIOS_LIST.filter((b) => b !== "Todos los barrios").map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.barrioChip, form.barrio === b && styles.barrioChipSelected]}
                  onPress={() => updateField("barrio", b)}
                >
                  <Text
                    style={[
                      styles.barrioChipText,
                      form.barrio === b && styles.barrioChipTextSelected,
                    ]}
                  >
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Dirección (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Av. Corrientes 1234"
              placeholderTextColor={Colors.textSecondary}
              value={form.address}
              onChangeText={(v) => updateField("address", v)}
            />

            <TouchableOpacity style={styles.locationBtn} onPress={getLocation}>
              <Ionicons name="locate-outline" size={20} color={Colors.surface} />
              <Text style={styles.locationBtnText}>
                {form.latitude ? "Ubicación GPS registrada ✓" : "Usar mi ubicación actual"}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>
              ¿Cuándo {form.type === PublicationType.LOST ? "lo perdiste" : "lo encontraste"}? (opcional)
            </Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: form.eventDate ? Colors.text : Colors.textSecondary, fontSize: 15 }}>
                {form.eventDate
                  ? new Date(form.eventDate).toLocaleDateString("es-AR")
                  : "Tocar para seleccionar fecha"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.eventDate ? new Date(form.eventDate) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    updateField("eventDate", selectedDate.toISOString());
                  }
                }}
              />
            )}
          </View>
        );

      case "images":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Fotos (opcional)</Text>
            <Text style={styles.stepSubtitle}>Agregá hasta 4 fotos</Text>
            <View style={styles.imageGrid}>
              {form.images.map((img, i) => (
                <View key={i} style={styles.imageContainer}>
                  <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(i)}>
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              {form.images.length < 4 && (
                <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                  <Ionicons name="camera-outline" size={32} color={Colors.textSecondary} />
                  <Text style={styles.addImageText}>Agregar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case "review":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Revisá tu publicación</Text>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Tipo</Text>
              <Text style={styles.reviewValue}>{getTypeLabel(form.type)}</Text>
              <Text style={styles.reviewLabel}>Categoría</Text>
              <Text style={styles.reviewValue}>
                {CATEGORY_OPTIONS.find((c) => c.id === form.category)?.label}
              </Text>
              <Text style={styles.reviewLabel}>Título</Text>
              <Text style={styles.reviewValue}>{form.title}</Text>
              <Text style={styles.reviewLabel}>Descripción</Text>
              <Text style={styles.reviewValue}>{form.description}</Text>
              <Text style={styles.reviewLabel}>Barrio</Text>
              <Text style={styles.reviewValue}>{form.barrio}</Text>
              {form.address ? (
                <>
                  <Text style={styles.reviewLabel}>Dirección</Text>
                  <Text style={styles.reviewValue}>{form.address}</Text>
                </>
              ) : null}
              {form.eventDate && (
                <>
                  <Text style={styles.reviewLabel}>Fecha</Text>
                  <Text style={styles.reviewValue}>
                    {new Date(form.eventDate).toLocaleDateString("es-AR")}
                  </Text>
                </>
              )}
              {form.images.length > 0 && (
                <>
                  <Text style={styles.reviewLabel}>Fotos</Text>
                  <Text style={styles.reviewValue}>{form.images.length} imagen(es)</Text>
                </>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i <= step && styles.progressDotActive]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Botones de navegación */}
      <View style={styles.navRow}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
            <Text style={styles.backBtnText}>Atrás</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canAdvance() && styles.btnDisabled]}
            onPress={nextStep}
            disabled={!canAdvance()}
          >
            <Text style={styles.nextBtnText}>Siguiente</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.surface} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.surface} />
                <Text style={styles.submitBtnText}>Publicar</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: Colors.surface,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  progressDotActive: { backgroundColor: Colors.primary },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  stepContainer: {},
  stepTitle: { fontSize: 22, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },

  // Type options
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionCardSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionTitle: { fontSize: 16, fontWeight: "600", color: Colors.text },
  optionTitleSelected: { color: Colors.surface },
  optionDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  optionDescSelected: { color: Colors.surface },

  // Category grid
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoryCard: {
    width: "47%",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  categoryCardSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, marginTop: 8 },
  categoryLabelSelected: { color: Colors.surface },

  // Inputs
  inputLabel: { fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 6 },
  helperText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  charCount: { fontSize: 12, color: Colors.textSecondary, textAlign: "right", marginBottom: 12 },

  // Barrio chips
  barrioGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  barrioChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  barrioChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  barrioChipText: { fontSize: 13, color: Colors.text },
  barrioChipTextSelected: { color: Colors.surface },

  // Location button
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  locationBtnText: { color: Colors.surface, fontSize: 14, fontWeight: "600" },

  // Images
  imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  imageContainer: { position: "relative" },
  imageThumb: { width: 100, height: 100, borderRadius: 10 },
  removeImageBtn: { position: "absolute", top: -8, right: -8 },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },

  // Review
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 12,
  },
  reviewValue: { fontSize: 15, color: Colors.text, marginTop: 2 },

  // Navigation
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 8 },
  backBtnText: { fontSize: 15, color: Colors.text },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  nextBtnText: { color: Colors.surface, fontSize: 15, fontWeight: "600" },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success || "#22c55e",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  submitBtnText: { color: Colors.surface, fontSize: 15, fontWeight: "600" },
  btnDisabled: { opacity: 0.5 },
});
