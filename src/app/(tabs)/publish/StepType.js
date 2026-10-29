import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getTypeLabel, PublicationType } from "../../../constants/publicationConstants";
import { Colors } from "../../../constants/theme";

export default function StepType({ form, updateField }) {
  return (
    <View>
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
            <Text style={[styles.optionTitle, form.type === t && styles.optionTitleSelected]}>
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
}

const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  optionCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface,
    borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: Colors.border,
  },
  optionCardSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionTitle: { fontSize: 16, fontWeight: "600", color: Colors.text },
  optionTitleSelected: { color: Colors.surface },
  optionDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  optionDescSelected: { color: Colors.surface },
});
