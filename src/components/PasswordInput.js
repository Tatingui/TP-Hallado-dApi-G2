import { useState } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize } from "../constants/theme";

/**
 * Campo de contrasena con boton de ojito para mostrar/ocultar.
 * Por defecto la contrasena esta oculta (ojo cerrado).
 * Props:
 *   value, onChangeText, placeholder, style (opcional)
 */
export default function PasswordInput({ value, onChangeText, placeholder, style }) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder || "Tu contrasena"}
        placeholderTextColor={Colors.disabled}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        style={styles.eyeButton}
        onPress={() => setVisible(!visible)}
        hitSlop={8}
      >
        <Ionicons
          name={visible ? "eye" : "eye-off"}
          size={22}
          color={Colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  eyeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
});
