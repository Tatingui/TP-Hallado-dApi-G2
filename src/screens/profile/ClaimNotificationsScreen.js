import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, FontSize, Spacing } from "../../constants/theme";
import {
  getClaimNotifications,
  markAllClaimNotificationsAsRead,
  markClaimNotificationAsRead,
  getClaimNotificationNavigation,
} from "../../repositories/claimNotificationRepository";

function formatReceivedAt(receivedAt) {
  if (!receivedAt) return "";
  const date = receivedAt instanceof Date ? receivedAt : new Date(receivedAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function ClaimNotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setNotifications(await getClaimNotifications());
    } catch (error) {
      console.warn("Error cargando novedades:", error);
      setNotifications([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllClaimNotificationsAsRead();
    await loadNotifications();
  };

  const handleOpenNotification = async (notification) => {
    await markClaimNotificationAsRead(notification.id);
    await loadNotifications();
    const destination = getClaimNotificationNavigation(notification);
    navigation.navigate("Main", {
      screen: "ClaimsTab",
      params: {
        tab: destination.tab,
        claimId: destination.claimId,
      },
    });
  };

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  const renderNotification = ({ item }) => (
    <Pressable
      style={[
        styles.notificationCard,
        item.readAt ? styles.readCard : styles.unreadCard,
      ]}
      onPress={() => handleOpenNotification(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          {!item.readAt && <View style={styles.unreadDot} />}
          <Text style={styles.notificationTitle}>{item.title}</Text>
        </View>
        <Text style={item.readAt ? styles.readLabel : styles.unreadLabel}>
          {item.readAt ? "Leída" : "Nueva"}
        </Text>
      </View>
      {item.message ? (
        <Text style={styles.notificationMessage}>{item.message}</Text>
      ) : null}
      {item.receivedAt ? (
        <Text style={styles.notificationDate}>
          {formatReceivedAt(item.receivedAt)}
        </Text>
      ) : null}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Novedades</Text>
        {unreadCount > 0 ? (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
          </View>
        ) : null}
      </View>

      {notifications.length > 0 && (
        <Pressable
          style={styles.markAllButton}
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <Ionicons
            name="checkmark-done-outline"
            size={18}
            color={unreadCount > 0 ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.markAllText,
              unreadCount === 0 && styles.markAllTextDisabled,
            ]}
          >
            Marcar todas como leídas
          </Text>
        </Pressable>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No hay novedades</Text>
            <Text style={styles.emptySubtitle}>
              Las novedades de tus reclamos aparecerán acá.
            </Text>
            <Image
              source={require("../../../assets/images/no-notifs.gif")}
              style={styles.noNotificationsGif}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 50,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  headerBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  markAllText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  markAllTextDisabled: {
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  notificationCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
  },
  unreadCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
    borderLeftWidth: 4,
  },
  readCard: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    opacity: 0.72,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  notificationTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  unreadLabel: {
    color: Colors.error,
    fontSize: 10,
    fontWeight: "800",
  },
  readLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },
  notificationMessage: {
    marginTop: 6,
    color: Colors.text,
    fontSize: FontSize.sm,
  },
  notificationDate: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
  },
  noNotificationsGif: {
    width: 200,
    height: 200,
    marginTop: 40,
  },
  emptyTitle: {
    marginTop: Spacing.sm,
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  emptySubtitle: {
    marginTop: 4,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
});
