import { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import OfflineBanner from '../../components/OfflineBanner';
import ClaimCard from '../../components/ClaimCard';
import { ClaimStatus } from '../../constants/publicationConstants';
import MeetingPointModal from '../../components/MeetingPointModal';
import useClaims from '../../hooks/useClaims';

export default function ClaimsScreen() {
  const navigation = useNavigation();
  const { tab } = useRoute().params ?? {};

  const [selectedTab, setActiveTab] = useState('SENT');
  const activeTab = tab === 'received' ? 'RECEIVED' : tab === 'sent' ? 'SENT' : selectedTab;

  useEffect(() => {
    if (tab === 'received' || tab === 'sent') {
      setActiveTab(tab === 'received' ? 'RECEIVED' : 'SENT');
      // Consumir el destino permite volver a pedirlo tras cambiar de pestaña manualmente.
      navigation.setParams({ tab: undefined });
    }
  }, [tab, navigation]);

  // La carga, la paginación y las acciones viven en useClaims; su efecto corre después del de la pestaña, como antes.
  const {
    claims,
    loading,
    refreshing,
    loadingMore,
    isOfflineMode,
    processingId,
    meetingClaim,
    setMeetingClaim,
    isSubmittingMeeting,
    handleRefresh,
    handleLoadMore,
    handleRespond,
    handleSubmitMeeting,
    handleAcceptMeeting,
    handleConfirmDelivery,
    handleCancelClaim,
  } = useClaims(activeTab);

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
        <OfflineBanner
          message={claims.length > 0
            ? "Sin conexión: mostrando los últimos reclamos guardados. Se requiere internet para responderlos."
            : "Sin conexión: no se pudieron cargar los reclamos."}
        />
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
              isOfflineMode={isOfflineMode}
              claim={item}
              type={activeTab}
              onOpenPublication={(publicationId) =>
                navigation.navigate("PublicationDetail", { id: String(publicationId) })
              }
              isProcessing={processingId === item.id}
              onAccept={(id) => handleRespond(id, ClaimStatus.ACCEPTED)}
              onReject={(id) => handleRespond(id, ClaimStatus.REJECTED)}
              onProposeMeeting={(claim) => setMeetingClaim(claim)}
              onAcceptMeeting={handleAcceptMeeting}
              onConfirmDelivery={handleConfirmDelivery}
              onCancelClaim={handleCancelClaim}
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
