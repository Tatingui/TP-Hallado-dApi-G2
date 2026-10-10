import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSize } from "../constants/theme";

const CRITERIA = [
  { key: "length", label: "Al menos 6 caracteres", test: (p) => p.length >= 6 },
  { key: "upper", label: "Una letra mayuscula", test: (p) => /[A-Z]/.test(p) },
  { key: "number", label: "Un numero", test: (p) => /[0-9]/.test(p) },
  { key: "special", label: "Un caracter especial (!@#$...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/**
 * Muestra los criterios de seguridad de la contrasena con feedback visual.
 * Props:
 *   password: string
 */
export default function PasswordCriteria({ password }) {
  if (!password) return null;

  return (
    <View style={styles.container}>
      {CRITERIA.map((c) => {
        const ok = c.test(password);
        return (
          <View key={c.key} style={styles.row}>
            <Text style={[styles.icon, ok ? styles.iconOk : styles.iconFail]}>
              {ok ? "✓" : "✗"}
            </Text>
            <Text style={[styles.label, ok ? styles.labelOk : styles.labelFail]}>
              {c.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Valida si la contrasena cumple todos los criterios.
 * Retorna { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];
  for (const c of CRITERIA) {
    if (!c.test(password)) {
      errors.push(c.label);
    }
  }
  return { valid: errors.length === 0, errors };
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  icon: {
    fontSize: FontSize.sm,
    width: 20,
    textAlign: "center",
  },
  iconOk: {
    color: Colors.success,
  },
  iconFail: {
    color: Colors.error,
  },
  label: {
    fontSize: 12,
    marginLeft: 4,
  },
  labelOk: {
    color: Colors.success,
  },
  labelFail: {
    color: Colors.textSecondary,
  },
});
