import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, FontSize, Spacing } from "../../constants/theme";
import usePublicProfile from "../../hooks/usePublicProfile";
import PublicProfileSummary from "../../components/profile/PublicProfileSummary";
import PublicProfileBadges from "../../components/profile/PublicProfileBadges";
import PublicProfileThanks from "../../components/profile/PublicProfileThanks";
import PublicProfileFooter from "../../components/profile/PublicProfileFooter";

export default function PublicProfileScreen() {
  const navigation = useNavigation();
  const { id } = useRoute().params ?? {};
  const { loading, publicData } = usePublicProfile(id);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil público...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textOnPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Perfil Público</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Card */}
        <View style={styles.card}>
          <PublicProfileSummary publicData={publicData} />

          {/* Insignias */}
          <PublicProfileBadges insignias={publicData?.insignias} />

          <PublicProfileThanks agradecimientos={publicData?.agradecimientos} />

          <PublicProfileFooter miembroDesde={publicData?.miembroDesde} />
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
});
