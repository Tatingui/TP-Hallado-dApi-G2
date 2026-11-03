import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing } from "../../constants/theme";

/**
 * Lista de agradecimientos públicos recibidos. No renderiza nada si no hay.
 */
export default function PublicProfileThanks({ agradecimientos }) {
  if (!(agradecimientos?.length > 0)) return null;

  return (
    <View style={styles.thanksSection}>
      <Text style={styles.sectionSubtitle}>
        Agradecimientos recibidos:
      </Text>
      {agradecimientos.map((thanks, index) => (
        <View
          key={`${thanks.createdAt}-${index}`}
          style={styles.thanksCard}
        >
          <Ionicons name="heart" size={16} color={Colors.error} />
          <View style={styles.thanksContent}>
            <Text style={styles.thanksText}>“{thanks.message}”</Text>
            <Text style={styles.thanksAuthor}>
              — {thanks.authorName}
            </Text>
          </View>
        </View>
      ))}
    </View>
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
});
