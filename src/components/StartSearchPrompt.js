import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

/**
 * Estado inicial del inicio (Punto 3): antes de la primera búsqueda no hay
 * resultados que mostrar, así que se invita a usar el buscador guiado.
 */
export default function StartSearchPrompt({ onStart }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="map-search-outline" size={48} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Empezá tu búsqueda</Text>
      <Text style={styles.subtitle}>
        Contanos qué te pasó y te mostramos lo que publicaron otros vecinos.
      </Text>
      <Pressable style={styles.button} onPress={onStart}>
        <MaterialCommunityIcons name="tune-variant" size={18} color={Colors.surface} />
        <Text style={styles.buttonText}>Abrir Buscador Guiado</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingHorizontal: 32, paddingTop: 48 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "700", color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", marginBottom: 20 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  buttonText: { color: Colors.surface, fontSize: 15, fontWeight: "600" },
});
