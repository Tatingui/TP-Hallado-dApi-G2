import { View, Text, StyleSheet } from "react-native";
import { Colors, FontSize, Spacing } from "../../constants/theme";

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Registro</Text>
      <Text style={styles.subtext}>Se implementa en el próximo incremento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});
