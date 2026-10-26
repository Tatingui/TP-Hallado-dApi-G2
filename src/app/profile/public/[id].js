import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, FontSize, Spacing } from "../../../constants/theme";
import { getPublicProfile } from "../../../services/userService";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [publicData, setPublicData] = useState(null);

  useEffect(() => {
    if (id) {
      loadPublicProfile(id);
    }
  }, [id]);

  async function loadPublicProfile(userId) {
    try {
      setLoading(true);
      const data = await getPublicProfile(userId);
      setPublicData(data);
    } catch (err) {
      Alert.alert(
        "Error",
        err?.message || "No se pudo cargar el perfil público solicitado.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil público...</Text>
      </View>
    );
  }

  const initials = publicData?.nombre
    ? publicData.nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "P";

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textOnPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Perfil Público</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            {publicData?.profileImageUrl ? (
              <Image
                source={{ uri: publicData.profileImageUrl }}
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

          {/* Insignias */}
          <Text style={styles.sectionSubtitle}>Insignias y Logros:</Text>
          <View style={styles.insigniasContainer}>
            {publicData?.insignias && publicData.insignias.length > 0 ? (
              publicData.insignias.map((insignia, index) => (
                <View key={index} style={styles.badgeChip}>
                  <Ionicons name="star" size={14} color={Colors.badgeStar} />
                  <Text style={styles.badgeText}>{insignia}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noInsigniasText}>Sin insignias aún.</Text>
            )}
          </View>

          {publicData?.agradecimientos?.length > 0 && (
            <View style={styles.thanksSection}>
              <Text style={styles.sectionSubtitle}>
                Agradecimientos recibidos:
              </Text>
              {publicData.agradecimientos.map((thanks, index) => (
                <View
                  key={`${thanks.createdAt}-${index}`}
                  style={styles.thanksCard}
                >
                  <Ionicons name="heart" size={16} color="#EF4444" />
                  <View style={styles.thanksContent}>
                    <Text style={styles.thanksText}>“{thanks.message}”</Text>
                    <Text style={styles.thanksAuthor}>
                      — {thanks.authorName}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.antiguedadRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.antiguedadText}>
              Antigüedad: {publicData?.miembroDesde || "Reciente"}
            </Text>
          </View>

          {/* Privacidad notice */}
          <View style={styles.privacyNotice}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={Colors.primary}
            />
            <Text style={styles.privacyNoticeText}>
              Por privacidad y seguridad de la comunidad, el teléfono y el
              correo de contacto no se muestran públicamente.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  topBar: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  backButton: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
    color: Colors.textOnPrimary,
  },
  content: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
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
  sectionSubtitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    alignSelf: "flex-start",
    marginBottom: Spacing.xs,
  },
  insigniasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    alignSelf: "flex-start",
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
  thanksSection: {
    width: "100%",
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    alignSelf: "stretch",
  },
  thanksCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  thanksContent: {
    flex: 1,
    minWidth: 0,
  },
  thanksText: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 19,
    flexShrink: 1,
  },
  thanksAuthor: {
    marginTop: 4,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  antiguedadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  antiguedadText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  privacyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.sm,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privacyNoticeText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
