import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, FontSize, Spacing } from "../../constants/theme";

export default function AlertsSection({ alertsCount, alertsNewCount }) {
  return (
    <Pressable
      style={styles.sectionCard}
      onPress={() => router.push("/profile/alerts")}
    >
      <View style={styles.accordionHeader}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Mis alertas</Text>
        </View>
        <View style={styles.accordionMeta}>
          {alertsNewCount > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>
                {alertsNewCount === 1 ? "1 nueva" : `${alertsNewCount} nuevas`}
              </Text>
            </View>
          )}
          <Text style={styles.accordionCount}>{alertsCount}</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </View>
      </View>
      <Text style={styles.helperText}>
        {alertsCount === 0
          ? "Guardá una búsqueda como alerta para enterarte de publicaciones nuevas."
          : "Ver, pausar o eliminar tus búsquedas guardadas."}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: "bold", color: Colors.text },
  accordionMeta: { flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: Spacing.sm },
  accordionCount: { fontSize: FontSize.sm, fontWeight: "700", color: Colors.primary },
  newBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  newBadgeText: { color: Colors.surface, fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  helperText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
