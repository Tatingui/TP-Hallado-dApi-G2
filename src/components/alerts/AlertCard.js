import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";

/**
 * Tarjeta de una alerta guardada: resumen, badges de nuevas/pausada
 * y botones para pausar/reanudar o eliminar. Solo presentación.
 */
export default function AlertCard({
  alert,
  summary,
  isConnected,
  isProcessing,
  onPress,
  onToggleActive,
  onDelete,
}) {
  const hasNews = alert.active && alert.newCount > 0;

  return (
    <Pressable
      style={[styles.card, !alert.active && styles.cardPaused]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Ionicons
          name={alert.active ? "notifications" : "notifications-off-outline"}
          size={20}
          color={alert.active ? Colors.primary : Colors.textSecondary}
        />
        <Text style={styles.summary} numberOfLines={2}>
          {summary}
        </Text>
        {hasNews && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>
              {alert.newCount === 1 ? "1 nueva" : `${alert.newCount} nuevas`}
            </Text>
          </View>
        )}
        {!alert.active && (
          <View style={styles.pausedBadge}>
            <Text style={styles.pausedBadgeText}>Pausada</Text>
          </View>
        )}
      </View>

      <Text style={styles.hint}>Tocá para ver las publicaciones que coinciden</Text>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, !isConnected && styles.actionDisabled]}
          onPress={onToggleActive}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Ionicons name={alert.active ? "pause" : "play"} size={16} color={Colors.primary} />
              <Text style={styles.actionText}>{alert.active ? "Pausar" : "Reanudar"}</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton, !isConnected && styles.actionDisabled]}
          onPress={onDelete}
          disabled={isProcessing}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
    padding: 14,
    marginBottom: 12,
  },
  cardPaused: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summary: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.gray900,
  },
  newBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  pausedBadge: {
    backgroundColor: Colors.gray200,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pausedBadgeText: {
    color: Colors.gray600,
    fontSize: 11,
    fontWeight: "700",
  },
  hint: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.purple200,
    backgroundColor: Colors.purple50,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  deleteButton: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  deleteText: {
    color: Colors.error,
    fontWeight: "600",
    fontSize: 13,
  },
});
