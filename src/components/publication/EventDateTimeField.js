import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../../constants/theme";
import { formatDate, formatTime, parseDate, toLocalDateTimeString } from "../../utils/date";

/**
 * Fecha y hora del suceso (Punto 5). En Android el selector no admite fecha y hora
 * juntas, así que se eligen con dos botones. No permite elegir un momento futuro.
 *
 * `value` y el valor de `onChange` son strings locales "AAAA-MM-DDTHH:mm:ss".
 */
export default function EventDateTimeField({ value, onChange }) {
  const [pickerMode, setPickerMode] = useState(null);
  const selected = parseDate(value);
  const current = selected ?? new Date();

  function handlePick(_event, picked) {
    const mode = pickerMode;
    setPickerMode(Platform.OS === "ios" ? mode : null);
    if (!picked) return;

    const next = new Date(current);
    if (mode === "date") {
      next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
    } else {
      next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    }

    if (next > new Date()) {
      Alert.alert("Fecha inválida", "La fecha y hora del suceso no pueden ser futuras.");
      return;
    }
    onChange(toLocalDateTimeString(next));
  }

  return (
    <View>
      <View style={styles.row}>
        <PickerButton
          icon="calendar-outline"
          text={selected ? formatDate(selected) : "Fecha"}
          filled={!!selected}
          onPress={() => setPickerMode("date")}
        />
        <PickerButton
          icon="time-outline"
          text={selected ? formatTime(selected) : "Hora"}
          filled={!!selected}
          onPress={() => setPickerMode("time")}
        />
      </View>
      {!selected && (
        <Text style={styles.hint}>Si no la elegís, se usa la fecha y hora actual.</Text>
      )}

      {pickerMode && (
        <DateTimePicker
          value={current}
          mode={pickerMode}
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={pickerMode === "date" ? new Date() : undefined}
          onValueChange={handlePick}
          onDismiss={() => setPickerMode(null)}
        />
      )}
    </View>
  );
}

function PickerButton({ icon, text, filled, onPress }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <Text style={[styles.buttonText, !filled && styles.placeholder]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: { fontSize: 15, color: Colors.text },
  placeholder: { color: Colors.textSecondary },
  hint: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
});
