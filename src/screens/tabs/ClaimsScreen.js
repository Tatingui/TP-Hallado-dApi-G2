import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { checkNetworkConnection } from '../../hooks/useNetworkStatus';
import OfflineBanner from '../../components/OfflineBanner';
import {
  getMySentClaimsApi,
  getMyReceivedClaimsApi,
  respondToClaimApi,
  proposeMeetingPointApi,
  acceptMeetingPointApi
} from '../../services/claimService';
import ClaimCard from '../../components/ClaimCard';
import MeetingPointModal from '../../components/MeetingPointModal';

export default function ClaimsScreen() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('SENT'); // SENT or RECEIVED
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Punto 8: reclamo sobre el que se está proponiendo un punto de encuentro
  const [meetingClaim, setMeetingClaim] = useState(null);
  const [isSubmittingMeeting, setIsSubmittingMeeting] = useState(false);

  useEffect(() => {
    fetchClaims(0, true);
  }, [activeTab]);

  const fetchClaims = async (pageToFetch = 0, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    setIsOfflineMode(false);

    try {
      let response;
      if (activeTab === 'SENT') {
        response = await getMySentClaimsApi(pageToFetch, 10, token);
      } else {
        response = await getMyReceivedClaimsApi(pageToFetch, 10, token);
      }

      const newContent = response.content || [];
      if (pageToFetch === 0) {
        setClaims(newContent);
      } else {
        setClaims(prev => [...prev, ...newContent]);
      }

      setPage(response.pageNumber || 0);
      setIsLastPage(response.last ?? true);
    } catch (err) {
      console.error("Error loading claims", err);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClaims(0, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !isLastPage && !loading && !isOfflineMode) {
      fetchClaims(page + 1, false);
    }
  };

  const handleRespond = async (claimId, newStatus) => {
    const isOnline = await checkNetworkConnection();
    if (!isOnline || isOfflineMode) {
      Alert.alert("Sin conexión", "Se requiere conexión a internet para aceptar o rechazar reclamos.");
      return;
    }

    const actionText = newStatus === 'ACCEPTED' ? 'aceptar' : 'rechazar';

    Alert.alert(
      "Confirmar acción",
      `¿Estás seguro de que querés ${actionText} este reclamo? ${newStatus === 'ACCEPTED' ? 'Los demás reclamos pendientes para esta publicación serán rechazados automáticamente.' : ''}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: newStatus === 'ACCEPTED' ? "default" : "destructive",
          onPress: async () => {
            try {
              setProcessingId(claimId);
              await respondToClaimApi(claimId, newStatus, token);
              fetchClaims(0, true);
            } catch (err) {
              Alert.alert("Error", err.message || "No se pudo actualizar el estado del reclamo.");
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const handleSubmitMeeting = async (address) => {
    try {
      setIsSubmittingMeeting(true);
      await proposeMeetingPointApi(meetingClaim.id, address, token);
      setMeetingClaim(null);
      Alert.alert("Propuesta enviada", "La otra parte puede aceptarla o sugerir otro lugar.");
      fetchClaims(0, true);
    } catch (err) {
      Alert.alert("Error", err.message || "No se pudo enviar la propuesta.");
    } finally {
      setIsSubmittingMeeting(false);
    }
  };

  const handleAcceptMeeting = (claimId) => {
    Alert.alert(
      "Confirmar punto de encuentro",
      "¿Aceptás este lugar? Una vez confirmado no se puede cambiar.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aceptar",
          onPress: async () => {
            try {
              setProcessingId(claimId);
              await acceptMeetingPointApi(claimId, token);
              fetchClaims(0, true);
            } catch (err) {
              Alert.alert("Error", err.message || "No se pudo aceptar el punto de encuentro.");
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header and Tabs */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Reclamos</Text>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'SENT' && styles.tabActive]}
            onPress={() => setActiveTab('SENT')}
          >
            <Text style={[styles.tabText, activeTab === 'SENT' && styles.tabTextActive]}>
              Enviados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'RECEIVED' && styles.tabActive]}
            onPress={() => setActiveTab('RECEIVED')}
          >
            <Text style={[styles.tabText, activeTab === 'RECEIVED' && styles.tabTextActive]}>
              Recibidos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isOfflineMode && (
        <OfflineBanner message="Sin conexión: No se pudieron cargar los reclamos. Se requiere internet para interactuar con los reclamos." />
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={claims}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ClaimCard
              claim={item}
              type={activeTab}
              isProcessing={processingId === item.id}
              onAccept={(id) => handleRespond(id, 'ACCEPTED')}
              onReject={(id) => handleRespond(id, 'REJECTED')}
              onProposeMeeting={(claim) => setMeetingClaim(claim)}
              onAcceptMeeting={handleAcceptMeeting}
            />
          )}
          contentContainerStyle={claims.length === 0 ? { flex: 1 } : { padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyTitle}>
                {isOfflineMode ? "Sin conexión" : "No hay reclamos aquí"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isOfflineMode
                  ? "Revisá tu conexión a internet para ver y gestionar reclamos."
                  : activeTab === 'SENT'
                  ? "Acá verás los reclamos que realices sobre publicaciones de otros usuarios."
                  : "Acá verás los reclamos que recibas sobre tus publicaciones."}
              </Text>
            </View>
          )}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ paddingVertical: 16 }} color={Colors.primary} />
            ) : null
          }
        />
      )}

      {/* Modal Punto de encuentro (Punto 8) */}
      <MeetingPointModal
        visible={!!meetingClaim}
        onClose={() => setMeetingClaim(null)}
        onSubmit={handleSubmitMeeting}
        isSubmitting={isSubmittingMeeting}
        currentAddress={meetingClaim?.meetingAddress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 }
});
