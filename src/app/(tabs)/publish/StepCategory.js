import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_OPTIONS } from "../../../constants/publicationConstants";
import { Colors } from "../../../constants/theme";

function mapCategoryIcon(icon) {
  switch (icon) {
    case "paw": return "paw-outline";
    case "key": return "key-outline";
    case "card-account-details": return "card-outline";
    case "cellphone": return "phone-portrait-outline";
    case "tshirt-crew": return "shirt-outline";
    default: return "ellipsis-horizontal-circle-outline";
  }
}

export default function StepCategory({ form, updateField }) {
  return (
    <View>
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
              name={mapCategoryIcon(cat.icon)}
              size={28}
              color={form.category === cat.id ? Colors.surface : Colors.primary}
            />
            <Text style={[styles.categoryLabel, form.category === cat.id && styles.categoryLabelSelected]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoryCard: {
    width: "47%", alignItems: "center", backgroundColor: Colors.surface,
    borderRadius: 12, padding: 16, borderWidth: 2, borderColor: Colors.border,
  },
  categoryCardSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, marginTop: 8 },
  categoryLabelSelected: { color: Colors.surface },
});
