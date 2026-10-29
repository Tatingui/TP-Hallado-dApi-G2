import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/theme";
import { resolveImageUrl } from "../../utils/imageUrl";

/**
 * Tarjeta del publicador: avatar, nombre, estadísticas, link al perfil público.
 * @param {{ publisher: Object, isOfflineMode: boolean }} props
 */
export default function PublisherCard({ publisher, isOfflineMode }) {
  const router = useRouter();

  if (!publisher) return null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        if (isOfflineMode) {
          Alert.alert("Sin conexión", "Se requiere conexión a internet para ver perfiles de usuarios.");
        } else {
          router.push(`/profile/public/${publisher.id}`);
        }
      }}
    >
      <View style={styles.avatar}>
        {publisher.profileImageUrl ? (
          <Image
            source={{ uri: resolveImageUrl(publisher.profileImageUrl) }}
            style={styles.avatarImage}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={48} color={Colors.textSecondary} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{publisher.nombre}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            {publisher.devolucionesConcretadas || 0} devoluciones
          </Text>
          <Text style={styles.statDot}>·</Text>
          <Ionicons name="thumbs-up-outline" size={12} color={Colors.success} />
          <Text style={[styles.statText, { color: Colors.success }]}>
            {publisher.valoracionesPositivas || 0}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: { marginRight: 12 },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: Colors.text },
  stats: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  statText: { fontSize: 12, color: Colors.textSecondary },
  statDot: { color: Colors.textSecondary },
});
