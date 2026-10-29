import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BARRIOS_LIST, PublicationType } from "../../../constants/publicationConstants";
import { Colors } from "../../../constants/theme";

export default function StepLocation({
  form, updateField, getLocation, showDatePicker, setShowDatePicker,
}) {
  return (
    <View>
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
            <Text style={[styles.barrioChipText, form.barrio === b && styles.barrioChipTextSelected]}>
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
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
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
          onValueChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) {
              updateField("eventDate", selectedDate.toISOString());
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: 14, fontSize: 15,
    color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 4,
  },
  barrioGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  barrioChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  barrioChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  barrioChipText: { fontSize: 13, color: Colors.text },
  barrioChipTextSelected: { color: Colors.surface },
  locationBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.primary, borderRadius: 10, padding: 14, marginTop: 16, gap: 8,
  },
  locationBtnText: { color: Colors.surface, fontSize: 14, fontWeight: "600" },
});
