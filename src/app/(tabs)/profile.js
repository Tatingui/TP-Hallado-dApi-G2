import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getMyProfile, updateMyProfile } from "../../services/userService";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import LogoHallado from "../../components/LogoHallado";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [updatingPhoneVisibility, setUpdatingPhoneVisibility] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
    } catch (err) {
      Alert.alert(
        "Error",
        err?.message || "No se pudo cargar el perfil. Revisa tu conexión."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleTogglePhoneVisibility = async (value) => {
    if (!profile) return;
    setUpdatingPhoneVisibility(true);
    const previousState = profile.telefonoVisible;

    // Optimistic UI update
    setProfile({ ...profile, telefonoVisible: value });

    try {
      const updated = await updateMyProfile({ telefonoVisible: value });
      setProfile(updated);
    } catch (err) {
      // Revert if error
      setProfile({ ...profile, telefonoVisible: previousState });
      Alert.alert("Error", "No se pudo actualizar la visibilidad del teléfono.");
    } finally {
      setUpdatingPhoneVisibility(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  const initials = profile?.nombre
    ? profile.nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <LogoHallado size={28} color={Colors.textOnPrimary} />
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>
      </View>

      {/* Profile Card / Avatar */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {profile?.profileImageUrl ? (
            <Image source={{ uri: profile.profileImageUrl }} style={styles.avatarImage} />
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

      {/* Visibilidad de Teléfono */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call-outline" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Contacto y Reclamos</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Teléfono:</Text>
          <Text style={styles.detailValue}>
            {profile?.telefono ? profile.telefono : "No registrado"}
          </Text>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Mostrar teléfono en reclamos</Text>
            <Text style={styles.toggleSublabel}>
              Permite que la otra parte vea tu número cuando se acepte un reclamo de objeto.
            </Text>
          </View>
          <Switch
            value={profile?.telefonoVisible ?? true}
            onValueChange={handleTogglePhoneVisibility}
            disabled={updatingPhoneVisibility}
            trackColor={{ false: Colors.disabled, true: Colors.primaryLight }}
            thumbColor={profile?.telefonoVisible ? Colors.primary : Colors.surface}
          />
        </View>
      </View>

      {/* Reputación y Solidaridad */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon-outline" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Reputación y Devoluciones</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile?.devolucionesConcretadas ?? 0}</Text>
            <Text style={styles.statLabel}>Devoluciones Concretadas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile?.porcentajePositivo ?? 0}%</Text>
            <Text style={styles.statLabel}>Valoración Positiva</Text>
          </View>
        </View>

        {/* Insignias */}
        <Text style={styles.insigniasTitle}>Insignias Obtenidas:</Text>
        <View style={styles.insigniasContainer}>
          {profile?.insignias && profile.insignias.length > 0 ? (
            profile.insignias.map((insignia, index) => (
              <View key={index} style={styles.badgeChip}>
                <Ionicons name="star" size={14} color={Colors.badgeStar} />
                <Text style={styles.badgeText}>{insignia}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noInsigniasText}>
              Completa 5 devoluciones para obtener la insignia "Vecino solidario".
            </Text>
          )}
        </View>

        <View style={styles.antiguedadRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.antiguedadText}>
            Miembro desde: {profile?.miembroDesde || "Reciente"}
          </Text>
        </View>
      </View>

      {/* Botón Ver Perfil Público */}
      <Pressable
        style={styles.publicProfileButton}
        onPress={() => {
          if (profile?.id) {
            router.push(`/profile/public/${profile.id}`);
          }
        }}
      >
        <Ionicons name="eye-outline" size={20} color={Colors.surface} />
        <Text style={styles.publicProfileButtonText}>Ver mi Perfil Público</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
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
    fontSize: FontSize.lg,
    fontWeight: "bold",
    color: Colors.text,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  barrioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  barrioText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "500",
  },
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
  editButtonText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: "bold",
    color: Colors.text,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  toggleLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  toggleSublabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
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
  insigniasTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  insigniasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.badgeBackground,
    borderWidth: 1,
    borderColor: Colors.badgeBorder,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: "bold",
    color: Colors.badgeText,
  },
  noInsigniasText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  antiguedadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  antiguedadText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  publicProfileButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 10,
  },
  publicProfileButtonText: {
    color: Colors.surface,
    fontSize: FontSize.md,
    fontWeight: "bold",
  },
});
