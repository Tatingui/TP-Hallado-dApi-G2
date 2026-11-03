import { StyleSheet, Switch, Text, View } from "react-native";
import { Colors, FontSize, Spacing } from "../../constants/theme";

/**
 * Fila de configuración con título, descripción y un Switch
 * (visibilidad del teléfono, bloqueo biométrico).
 */
export default function EditProfileSwitch({ label, sublabel, value, onValueChange }) {
  return (
    <View style={styles.switchGroup}>
      <View style={styles.switchTextContainer}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchSublabel}>{sublabel}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.disabled, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  switchGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  switchLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  switchSublabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
