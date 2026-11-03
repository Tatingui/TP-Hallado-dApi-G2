import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ActivityIndicator,
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
} from "../../constants/publicationConstants";
import { Colors } from "../../constants/theme";
import EventDateTimeField from "../../components/publication/EventDateTimeField";
import useEditPublication from "../../hooks/useEditPublication";

export default function EditPublicationScreen() {
  const navigation = useNavigation();
  const { id } = useRoute().params ?? {};
  const {
    form,
    loading,
    saving,
    loadingLocation,
    updateField,
    handleUseCurrentLocation,
    save,
  } = useEditPublication(id);

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
        <Pressable onPress={() => navigation.goBack()}>
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
          onPress={handleUseCurrentLocation}
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
        <Text style={styles.label}>Fecha y hora</Text>
        <EventDateTimeField
          value={form.eventDate}
          onChange={(value) => updateField("eventDate", value)}
        />
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
