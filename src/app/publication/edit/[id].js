import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  BARRIOS_LIST,
  PublicationType,
} from "../../../constants/publicationConstants";
import { Colors } from "../../../constants/theme";
import {
  getPublicationForEditApi,
  updatePublicationApi,
} from "../../../services/publicationService";

export default function EditPublicationScreen() {
  const { id } = useLocalSearchParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    getPublicationForEditApi(id)
      .then((publication) =>
        setForm({
          ...publication,
          eventDate: publication.eventDate || new Date().toISOString(),
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

  const useCurrentLocation = async () => {
    if (loadingLocation) return;
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso necesario", "Necesitamos acceso a tu ubicación.");
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          "GPS desactivado",
          "Activá la ubicación del dispositivo e intentá nuevamente.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });
      setForm((current) => ({
        ...current,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
      Alert.alert("Ubicación obtenida", "Se registró tu ubicación actual.");
    } catch (error) {
      Alert.alert(
        "Error",
        error?.message || "No se pudo obtener la ubicación.",
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const save = async () => {
    const questionRequired = form.type === PublicationType.FOUND;
    if (form.title.trim().length < 5 || form.description.trim().length < 10) {
      Alert.alert(
        "Datos incompletos",
        "El título debe tener 5 caracteres y la descripción 10 como mínimo.",
      );
      return;
    }
    if (!form.barrio?.trim()) {
      Alert.alert("Datos incompletos", "Seleccioná un barrio.");
      return;
    }
    if (
      questionRequired &&
      (!form.verificationQuestion.trim() || !form.verificationAnswer.trim())
    ) {
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
        [{ text: "OK", onPress: () => router.replace(`/publication/${id}`) }],
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

  if (loading || !form) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Editar publicación</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(value) => updateField("title", value)}
          maxLength={100}
        />
        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={form.description}
          onChangeText={(value) => updateField("description", value)}
          multiline
          maxLength={500}
        />

        {form.type === PublicationType.FOUND && (
          <>
            <Text style={styles.label}>Pregunta de verificación *</Text>
            <TextInput
              style={styles.input}
              value={form.verificationQuestion}
              onChangeText={(value) =>
                updateField("verificationQuestion", value)
              }
              maxLength={200}
            />
            <Text style={styles.label}>Respuesta esperada *</Text>
            <TextInput
              style={styles.input}
              value={form.verificationAnswer}
              onChangeText={(value) => updateField("verificationAnswer", value)}
              maxLength={200}
            />
          </>
        )}

        <Text style={styles.label}>Barrio *</Text>
        <View style={styles.barrioGrid}>
          {BARRIOS_LIST.filter((barrio) => barrio !== "Todos los barrios").map(
            (barrio) => (
              <Pressable
                key={barrio}
                style={[
                  styles.barrio,
                  form.barrio === barrio && styles.barrioSelected,
                ]}
                onPress={() => updateField("barrio", barrio)}
              >
                <Text
                  style={
                    form.barrio === barrio
                      ? styles.barrioTextSelected
                      : styles.barrioText
                  }
                >
                  {barrio}
                </Text>
              </Pressable>
            ),
          )}
        </View>
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={form.address}
          onChangeText={(value) => updateField("address", value)}
        />
        <Pressable
          style={[styles.locationButton, loadingLocation && styles.disabledButton]}
          onPress={useCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.locationButtonText}>
              {form.latitude != null
                ? "Actualizar ubicación GPS"
                : "Usar ubicación actual"}
            </Text>
          )}
        </Pressable>
        <Text style={styles.label}>Fecha</Text>
        <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>
            {form.eventDate
              ? new Date(form.eventDate).toLocaleDateString("es-AR")
              : "Seleccionar fecha"}
          </Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={new Date(form.eventDate)}
            mode="date"
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) updateField("eventDate", date.toISOString());
            }}
          />
        )}
        <Pressable style={styles.saveButton} onPress={save} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Guardar cambios</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { fontSize: 36, lineHeight: 36, color: Colors.primary },
  headerTitle: { fontSize: 20, fontWeight: "800", color: Colors.text },
  content: { padding: 20, paddingBottom: 40 },
  label: {
    marginTop: 16,
    marginBottom: 7,
    fontWeight: "700",
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  multiline: { minHeight: 110, textAlignVertical: "top" },
  barrioGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  barrio: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  barrioSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  barrioText: { color: Colors.textSecondary, fontSize: 12 },
  barrioTextSelected: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  locationButton: {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  disabledButton: { opacity: 0.7 },
  locationButtonText: { color: Colors.surface, fontWeight: "700" },
  saveButton: {
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  saveText: { color: Colors.surface, fontWeight: "800" },
});
