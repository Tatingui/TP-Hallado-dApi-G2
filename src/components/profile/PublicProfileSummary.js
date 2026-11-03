import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing } from "../../constants/theme";
import { resolveImageUrl } from "../../utils/imageUrl";

/**
 * Encabezado del perfil público: avatar (foto o iniciales), nombre,
 * barrio y la grilla de estadísticas de reputación.
 */
export default function PublicProfileSummary({ publicData }) {
  const initials = publicData?.nombre
    ? publicData.nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "P";

  return (
    <>
      <View style={styles.avatarContainer}>
        {publicData?.profileImageUrl ? (
          <Image
            source={{ uri: resolveImageUrl(publicData.profileImageUrl) }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
      </View>

      <Text style={styles.userName}>
        {publicData?.nombre || "Usuario Hallado"}
      </Text>

      <View style={styles.barrioContainer}>
        <Ionicons
          name="location-outline"
          size={16}
          color={Colors.primary}
        />
        <Text style={styles.barrioText}>
          {publicData?.barrio
            ? publicData.barrio
            : "Barrio no especificado"}
        </Text>
      </View>

      {/* Stat Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {publicData?.devolucionesConcretadas ?? 0}
          </Text>
          <Text style={styles.statLabel}>Devoluciones Concretadas</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {publicData?.porcentajePositivo ?? 0}%
          </Text>
          <Text style={styles.statLabel}>Reputación Positiva</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    marginBottom: Spacing.sm,
  },
  avatarBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.textOnPrimary,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.text,
  },
  barrioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  barrioText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
});
