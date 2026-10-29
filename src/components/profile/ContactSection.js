import { StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing } from "../../constants/theme";

export default function ContactSection({
  profile,
  updatingPhoneVisibility,
  handleTogglePhoneVisibility,
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name="call-outline" size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>Contacto y Reclamos</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Teléfono:</Text>
        <Text style={styles.detailValue}>
          {profile?.telefono ? profile.telefono : "No registrado"}
        </Text>
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Mostrar teléfono en reclamos</Text>
          <Text style={styles.toggleSublabel}>
            Permite que la otra parte vea tu número cuando se acepte un reclamo
            de objeto.
          </Text>
        </View>
        <Switch
          value={profile?.telefonoVisible ?? true}
          onValueChange={handleTogglePhoneVisibility}
          disabled={updatingPhoneVisibility}
          trackColor={{ false: Colors.disabled, true: Colors.primaryLight }}
          thumbColor={
            profile?.telefonoVisible ? Colors.primary : Colors.surface
          }
        />
      </View>
    </View>
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
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  detailValue: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  toggleInfo: { flex: 1, marginRight: Spacing.sm },
  toggleLabel: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text },
  toggleSublabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
