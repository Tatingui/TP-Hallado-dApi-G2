import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, FontSize, Spacing } from "../../constants/theme";
import useProfile from "../../hooks/useProfile";
import ProfileHeader from "../../components/profile/ProfileHeader";
import AlertsSection from "../../components/profile/AlertsSection";
import FollowedSection from "../../components/profile/FollowedSection";
import ContactSection from "../../components/profile/ContactSection";

export default function ProfileScreen() {
  const {
    loading,
    refreshing,
    profile,
    followedPublications,
    followedPublicationsExpanded,
    followedTotal,
    followedUpdatesCount,
    alertsCount,
    alertsNewCount,
    updatingPhoneVisibility,
    onRefresh,
    handleOpenFollowedPublication,
    handleTogglePhoneVisibility,
    toggleFollowedExpanded,
    logout,
  } = useProfile();

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      <ProfileHeader profile={profile} />

      <AlertsSection alertsCount={alertsCount} alertsNewCount={alertsNewCount} />

      <FollowedSection
        followedPublications={followedPublications}
        followedPublicationsExpanded={followedPublicationsExpanded}
        followedTotal={followedTotal}
        followedUpdatesCount={followedUpdatesCount}
        toggleFollowedExpanded={toggleFollowedExpanded}
        handleOpenFollowedPublication={handleOpenFollowedPublication}
      />

      <ContactSection
        profile={profile}
        updatingPhoneVisibility={updatingPhoneVisibility}
        handleTogglePhoneVisibility={handleTogglePhoneVisibility}
      />

      {/* Reputación y Devoluciones */}
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

        <Pressable
          style={styles.linkButton}
          onPress={() => router.push("/profile/resolved-history")}
        >
          <Ionicons name="time-outline" size={18} color={Colors.primary} />
          <Text style={styles.linkButtonText}>Historial de casos resueltos</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </Pressable>

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

      {/* Acciones */}
      <Pressable
        style={styles.primaryButton}
        onPress={() => { if (profile?.id) router.push(`/profile/public/${profile.id}`); }}
      >
        <Ionicons name="eye-outline" size={20} color={Colors.surface} />
        <Text style={styles.primaryButtonText}>Ver mi Perfil Público</Text>
      </Pressable>

      <Pressable
        style={[styles.primaryButton, { backgroundColor: Colors.error, marginTop: 12 }]}
        onPress={async () => { await logout(); }}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.surface} />
        <Text style={styles.primaryButtonText}>Cerrar Sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { paddingBottom: Spacing.xxl },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: { marginTop: Spacing.sm, color: Colors.textSecondary, fontSize: FontSize.md },
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: "bold", color: Colors.text },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
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
  statNumber: { fontSize: FontSize.xl, fontWeight: "bold", color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: "center", marginTop: 2 },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  linkButtonText: { flex: 1, color: Colors.primary, fontSize: FontSize.sm, fontWeight: "700" },
  insigniasTitle: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.xs },
  insigniasContainer: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs, marginBottom: Spacing.md },
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
  badgeText: { fontSize: FontSize.xs, fontWeight: "bold", color: Colors.badgeText },
  noInsigniasText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontStyle: "italic" },
  antiguedadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  antiguedadText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  primaryButton: {
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
  primaryButtonText: { color: Colors.surface, fontSize: FontSize.md, fontWeight: "bold" },
});
