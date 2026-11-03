import { StyleSheet, Text, TextInput, View } from "react-native";
import { Colors, FontSize, Spacing } from "../../constants/theme";

/**
 * Campo de texto con etiqueta del formulario de edición de perfil.
 * Las props extra (placeholder, keyboardType, etc.) se pasan al TextInput.
 */
export default function EditProfileField({ label, value, onChangeText, ...inputProps }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={Colors.disabled}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
  },
});
