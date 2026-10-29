import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import LogoHallado from "../LogoHallado";
import { Colors, FontSize, Spacing } from "../../constants/theme";
import { resolveImageUrl } from "../../utils/imageUrl";

function getInitials(nombre) {
  if (!nombre) return "U";
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export default function ProfileHeader({ profile }) {
  const initials = getInitials(profile?.nombre);

  return (
    <>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <LogoHallado size={28} color={Colors.textOnPrimary} />
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {profile?.profileImageUrl ? (
            <Image
              source={{ uri: resolveImageUrl(profile.profileImageUrl) }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </View>
        <Text style={styles.userName}>{profile?.nombre || "Usuario"}</Text>
        <Text style={styles.userEmail}>{profile?.email}</Text>

        <View style={styles.barrioContainer}>
          <Ionicons name="location-outline" size={16} color={Colors.primary} />
          <Text style={styles.barrioText}>
            {profile?.barrio ? profile.barrio : "Sin barrio especificado"}
          </Text>
        </View>

        <Pressable
          style={styles.editButton}
          onPress={() => router.push("/profile/edit")}
        >
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.textOnPrimary,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.md,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: { marginBottom: Spacing.sm },
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
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  userName: { fontSize: FontSize.lg, fontWeight: "bold", color: Colors.text },
  userEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  barrioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  barrioText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "500" },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
  },
  editButtonText: { color: Colors.primary, fontWeight: "600", fontSize: FontSize.sm },
});
