import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSize } from "../constants/theme";

const CRITERIA = [
  { key: "length", label: "Al menos 6 caracteres", test: (p) => p.length >= 6 },
  { key: "upper", label: "Una letra mayúscula", test: (p) => /[A-Z]/.test(p) },
  { key: "number", label: "Un número", test: (p) => /[0-9]/.test(p) },
  { key: "special", label: "Un carácter especial (!@#$...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/**
 * Muestra los criterios de seguridad de la contraseña con feedback visual.
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
 * Valida si la contraseña cumple todos los criterios.
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

/**
 * Valida una contraseña nueva junto con su confirmación.
 * Retorna el mensaje de error a mostrar, o null si es válida.
 */
export function validateNewPassword(password, confirmation) {
  if (!password.trim() || !confirmation.trim()) {
    return "Completá la contraseña y su confirmación";
  }
  const { valid, errors } = validatePassword(password);
  if (!valid) {
    return "La contraseña no cumple: " + errors[0];
  }
  if (password !== confirmation) {
    return "Las contraseñas no coinciden";
  }
  return null;
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
