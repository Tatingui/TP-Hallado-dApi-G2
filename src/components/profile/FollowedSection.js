import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, FontSize, Spacing } from "../../constants/theme";

function getPublicationTypeLabel(type) {
  const normalized = String(type || "").toUpperCase();
  if (normalized === "FOUND") return "Encontrado";
  if (normalized === "LOST") return "Perdido";
  return normalized || "Publicación";
}

export default function FollowedSection({
  followedPublications,
  followedPublicationsExpanded,
  followedTotal,
  followedUpdatesCount,
  toggleFollowedExpanded,
  handleOpenFollowedPublication,
}) {
  return (
    <View style={styles.sectionCard}>
      <Pressable style={styles.accordionHeader} onPress={toggleFollowedExpanded}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bookmark-outline" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Publicaciones Seguidas</Text>
        </View>
        <View style={styles.accordionMeta}>
          {followedUpdatesCount > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>
                {followedUpdatesCount === 1 ? "1 novedad" : `${followedUpdatesCount} novedades`}
              </Text>
            </View>
          )}
          <Text style={styles.accordionCount}>{followedTotal}</Text>
          <Ionicons
            name={followedPublicationsExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={Colors.textSecondary}
          />
        </View>
      </Pressable>

      {followedPublicationsExpanded && (
        <>
          {followedPublications.length === 0 ? (
            <Text style={styles.helperText}>Todavía no seguís ninguna publicación.</Text>
          ) : (
            followedPublications.map((publication) => (
              <Pressable
                key={publication.id}
                style={styles.followedItem}
                onPress={() => handleOpenFollowedPublication(publication)}
              >
                <View style={styles.followedItemHeader}>
                  <Text style={styles.followedItemTitle} numberOfLines={1}>
                    {publication.title}
                  </Text>
                  {publication.hasNewUpdates && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>Novedad</Text>
                    </View>
                  )}
                </View>
                <View style={styles.followedItemSubRow}>
                  <Text style={styles.followedItemType}>
                    {getPublicationTypeLabel(publication.type)}
                  </Text>
                  <Text style={styles.followedItemMeta}>{publication.barrio}</Text>
                </View>
              </Pressable>
            ))
          )}

          {followedTotal > 0 && (
            <Pressable
              style={styles.linkButton}
              onPress={() => router.push("/profile/followed")}
            >
              <Ionicons name="list-outline" size={18} color={Colors.primary} />
              <Text style={styles.linkButtonText}>
                Ver todas las seguidas ({followedTotal})
              </Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: "bold", color: Colors.text },
  accordionMeta: { flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: Spacing.sm },
  accordionCount: { fontSize: FontSize.sm, fontWeight: "700", color: Colors.primary },
  newBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  newBadgeText: { color: Colors.surface, fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  helperText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  followedItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  followedItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  followedItemTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: "600", color: Colors.text },
  followedItemSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  followedItemType: { fontSize: 10, fontWeight: "700", color: Colors.primary, textTransform: "uppercase" },
  followedItemMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
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
});
