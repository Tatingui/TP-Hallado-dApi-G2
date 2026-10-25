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
import {
  getMySentClaimsApi,
  getMyReceivedClaimsApi,
  respondToClaimApi
} from '../../services/claimService';
import ClaimCard from '../../components/ClaimCard';

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

  useEffect(() => {
    fetchClaims(0, true);
  }, [activeTab]);

  const fetchClaims = async (pageToFetch = 0, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

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
      Alert.alert("Error", "No se pudieron cargar los reclamos.");
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
    if (!loadingMore && !isLastPage && !loading) {
      fetchClaims(page + 1, false);
    }
  };

  const handleRespond = async (claimId, newStatus) => {
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
              // Refrescar lista para actualizar el estado visualmente
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

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={claims}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ClaimCard
              claim={item}
              type={activeTab}
              isProcessing={processingId === item.id}
              onAccept={(id) => handleRespond(id, 'ACCEPTED')}
              onReject={(id) => handleRespond(id, 'REJECTED')}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>
                No hay reclamos {activeTab === 'SENT' ? 'enviados' : 'recibidos'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'SENT'
                  ? 'Acá vas a ver el estado de los objetos que estás intentando recuperar o devolver.'
                  : 'Cuando alguien reclame una publicación tuya, aparecerá en esta lista.'}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color={Colors.primary} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: Colors.primary || '#6D28D9',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  }
});
