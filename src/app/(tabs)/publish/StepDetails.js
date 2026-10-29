import { StyleSheet, Text, TextInput, View } from "react-native";
import { PublicationType } from "../../../constants/publicationConstants";
import { Colors } from "../../../constants/theme";

export default function StepDetails({ form, updateField, markTouched, fieldError }) {
  return (
    <View>
      <Text style={styles.stepTitle}>Detalles</Text>
      <Text style={styles.stepSubtitle}>Describí lo que perdiste o encontraste</Text>

      <Text style={styles.inputLabel}>Título *</Text>
      <TextInput
        style={[styles.input, fieldError("title") && styles.inputError]}
        placeholder="Ej: Perro labrador negro con collar rojo"
        placeholderTextColor={Colors.textSecondary}
        value={form.title}
        onChangeText={(v) => updateField("title", v)}
        onBlur={() => markTouched("title")}
        maxLength={100}
      />
      {fieldError("title") ? (
        <Text style={styles.errorText}>{fieldError("title")}</Text>
      ) : (
        <Text style={styles.charCount}>{form.title.length}/100</Text>
      )}

      <Text style={styles.inputLabel}>Descripción *</Text>
      <TextInput
        style={[styles.input, styles.textArea, fieldError("description") && styles.inputError]}
        placeholder="Detallá características, color, tamaño, dónde y cuándo fue..."
        placeholderTextColor={Colors.textSecondary}
        value={form.description}
        onChangeText={(v) => updateField("description", v)}
        onBlur={() => markTouched("description")}
        multiline
        numberOfLines={4}
        maxLength={500}
      />
      {fieldError("description") ? (
        <Text style={styles.errorText}>{fieldError("description")}</Text>
      ) : (
        <Text style={styles.charCount}>{form.description.length}/500</Text>
      )}

      {form.type === PublicationType.FOUND && (
        <>
          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Pregunta de verificación *</Text>
          <Text style={styles.helperText}>Una pregunta que solo el dueño real podría responder</Text>
          <TextInput
            style={[styles.input, fieldError("verificationQuestion") && styles.inputError]}
            placeholder="Ej: ¿Qué dice la chapita del collar?"
            placeholderTextColor={Colors.textSecondary}
            value={form.verificationQuestion}
            onChangeText={(v) => updateField("verificationQuestion", v)}
            onBlur={() => markTouched("verificationQuestion")}
            maxLength={200}
          />
          {fieldError("verificationQuestion") && (
            <Text style={styles.errorText}>{fieldError("verificationQuestion")}</Text>
          )}
          <Text style={styles.inputLabel}>Respuesta esperada *</Text>
          <TextInput
            style={[styles.input, fieldError("verificationAnswer") && styles.inputError]}
            placeholder="Ej: Luna"
            placeholderTextColor={Colors.textSecondary}
            value={form.verificationAnswer}
            onChangeText={(v) => updateField("verificationAnswer", v)}
            onBlur={() => markTouched("verificationAnswer")}
            maxLength={200}
          />
          {fieldError("verificationAnswer") && (
            <Text style={styles.errorText}>{fieldError("verificationAnswer")}</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 6 },
  helperText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: 14, fontSize: 15,
    color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 4,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  inputError: { borderColor: Colors.error, borderWidth: 1.5, backgroundColor: Colors.errorLight },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 2, marginBottom: 12 },
  charCount: { fontSize: 12, color: Colors.textSecondary, textAlign: "right", marginBottom: 12 },
});
