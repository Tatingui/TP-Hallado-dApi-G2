import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "./useAuth";
import {
  getFollowedPublicationsApi,
  getFollowedUpdatesCountApi,
  markPublicationAsSeenApi,
} from "../services/publicationService";
import { getMyProfile, updateMyProfile } from "../services/userService";
import { getMyAlertsApi } from "../services/alertService";
import { setProfileTabBadge } from "../storage/profileTabBadge";

/**
 * Hook que centraliza toda la lógica de la pantalla de perfil.
 */
export default function useProfile() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [followedPublications, setFollowedPublications] = useState([]);
  const [followedPublicationsExpanded, setFollowedPublicationsExpanded] =
    useState(true);
  const [followedTotal, setFollowedTotal] = useState(0);
  const [followedUpdatesCount, setFollowedUpdatesCount] = useState(0);
  const [updatingPhoneVisibility, setUpdatingPhoneVisibility] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);
  const [alertsNewCount, setAlertsNewCount] = useState(0);

  const loadAlertsSummary = useCallback(async () => {
    try {
      const alerts = (await getMyAlertsApi()) || [];
      const totalNew = alerts.reduce((sum, alert) => sum + (alert.newCount || 0), 0);
      setAlertsCount(alerts.length);
      setAlertsNewCount(totalNew);
      return totalNew;
    } catch (err) {
      console.warn("Error cargando alertas:", err);
      setAlertsCount(0);
      setAlertsNewCount(0);
      return 0;
    }
  }, []);

  const loadFollowedPublications = useCallback(async () => {
    try {
      const data = await getFollowedPublicationsApi(0, 3);
      const list = data?.content || [];
      setFollowedPublications(list);
      setFollowedTotal(data?.totalElements ?? list.length);
      const updates = await getFollowedUpdatesCountApi();
      const updatesCount = updates?.count || 0;
      setFollowedUpdatesCount(updatesCount);
      setProfileTabBadge(updatesCount > 0);
      return updatesCount > 0;
    } catch (err) {
      console.warn("Error cargando publicaciones seguidas:", err);
      setFollowedPublications([]);
      setFollowedTotal(0);
      setFollowedUpdatesCount(0);
      setProfileTabBadge(false);
      return false;
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      const followedHaveUpdates = await loadFollowedPublications();
      const alertsNew = await loadAlertsSummary();
      setProfileTabBadge(followedHaveUpdates || alertsNew > 0);
    } catch (err) {
      Alert.alert(
        "Error",
        err?.message || "No se pudo cargar el perfil. Revisa tu conexión.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadFollowedPublications, loadAlertsSummary]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleOpenFollowedPublication = async (publication) => {
    if (publication?.hasNewUpdates) {
      try {
        await markPublicationAsSeenApi(publication.id);
      } catch (error) {
        console.warn("Error marcando publicación como vista:", error);
      }
      setFollowedPublications((prev) =>
        prev.map((item) =>
          item.id === publication.id ? { ...item, hasNewUpdates: false } : item,
        ),
      );
      const remaining = Math.max(followedUpdatesCount - 1, 0);
      setFollowedUpdatesCount(remaining);
      setProfileTabBadge(remaining > 0 || alertsNewCount > 0);
    }
    router.push(`/publication/${publication.id}`);
  };

  const handleTogglePhoneVisibility = async (value) => {
    if (!profile) return;
    setUpdatingPhoneVisibility(true);
    const previousState = profile.telefonoVisible;
    setProfile({ ...profile, telefonoVisible: value });
    try {
      const updated = await updateMyProfile({ telefonoVisible: value });
      setProfile(updated);
    } catch (err) {
      setProfile({ ...profile, telefonoVisible: previousState });
      Alert.alert("Error", "No se pudo actualizar la visibilidad del teléfono.");
    } finally {
      setUpdatingPhoneVisibility(false);
    }
  };

  const toggleFollowedExpanded = () =>
    setFollowedPublicationsExpanded((prev) => !prev);

  return {
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
  };
}
