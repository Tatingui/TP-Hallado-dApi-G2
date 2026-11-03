import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { formatDate } from "../../utils/date";

/**
 * Tarjeta de un caso resuelto: datos de la publicación, contraparte,
 * mensaje de valoración y botón para valorar (o estado de la valoración).
 */
export default function ResolvedCaseCard({ item, onOpen, onRate }) {
  return (
    <View style={styles.card}>
      <Pressable onPress={() => onOpen(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.publicationTitle}
          </Text>
          <Ionicons name="open-outline" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.meta}>
          {item.role === "DEVOLVI" ? "Devolví" : "Recuperé"} ·{" "}
          {formatDate(item.resolvedAt)}
        </Text>
        <Text style={styles.counterpart}>
          Contraparte: {item.counterpartName}
        </Text>
        {item.ratingMessage ? (
          <View style={styles.ratingMessage}>
            <Ionicons name="chatbubble-outline" size={15} color={Colors.primary} />
            <View style={styles.ratingMessageContent}>
              <Text style={styles.ratingMessageLabel}>Tu mensaje</Text>
              <Text style={styles.ratingMessageText}>{item.ratingMessage}</Text>
            </View>
          </View>
        ) : null}
        {item.counterpartRatingMessage ? (
          <View style={styles.ratingMessage}>
            <Ionicons name="chatbubble-ellipses-outline" size={15} color={Colors.primary} />
            <View style={styles.ratingMessageContent}>
              <Text style={styles.ratingMessageLabel}>
                Mensaje de {item.counterpartName}
              </Text>
              <Text style={styles.ratingMessageText}>{item.counterpartRatingMessage}</Text>
            </View>
          </View>
        ) : null}
      </Pressable>
      {item.canRate ? (
        <Pressable style={styles.rateButton} onPress={() => onRate(item)}>
          <Ionicons name="star-outline" size={17} color="#fff" />
          <Text style={styles.rateButtonText}>Valorar caso</Text>
        </Pressable>
      ) : (
        <Text style={styles.rated}>
          {item.rated
            ? "Ya valoraste este caso"
            : "Plazo de valoración vencido"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    fontWeight: "800",
    color: Colors.gray900,
  },
  meta: {
    color: Colors.primary,
    marginTop: 6,
    fontWeight: "600",
  },
  counterpart: {
    color: Colors.gray500,
    marginTop: 5,
  },
  ratingMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.purple50,
  },
  ratingMessageText: {
    flex: 1,
    color: Colors.gray600,
    fontSize: 13,
    lineHeight: 18,
  },
  ratingMessageContent: {
    flex: 1,
  },
  ratingMessageLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  rateButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 7,
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  rateButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  rated: {
    color: Colors.gray500,
    marginTop: 12,
    fontSize: 12,
  },
});
