import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing } from "../../constants/theme";

/**
 * Sección de insignias y logros del perfil público.
 */
export default function PublicProfileBadges({ insignias }) {
  return (
    <>
      <Text style={styles.sectionSubtitle}>Insignias y Logros:</Text>
      <View style={styles.insigniasContainer}>
        {insignias && insignias.length > 0 ? (
          insignias.map((insignia, index) => (
            <View key={index} style={styles.badgeChip}>
              <Ionicons name="star" size={14} color={Colors.badgeStar} />
              <Text style={styles.badgeText}>{insignia}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noInsigniasText}>Sin insignias aún.</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
});
