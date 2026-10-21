import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import LogoHallado from '../../components/LogoHallado';
import PublicationCard from '../../components/PublicationCard';
import GuidedSearchModal from '../../components/GuidedSearchModal';
import EmptySearchResults from '../../components/EmptySearchResults';
import {
  PublicationType,
  CATEGORY_OPTIONS,
  getCategoryLabel,
  getTypeLabel,
} from '../../constants/publicationConstants';
import { searchPublicationsApi } from '../../services/publicationService';
import {
  saveSearchCacheOffline,
  getOfflineSearchCache,
} from '../../storage/offlinePublicationsStorage';

export default function HomeScreen() {
  const router = useRouter();

  // Guided Search State
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    type: PublicationType.LOST, // User condition: LOST -> target search FOUND
    category: null,
    query: '',
    barrio: '',
    dateFilter: 'ALL',
    lat: null,
    lng: null,
  });

  // Results & Pagination State
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent or distance
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    fetchResults(0, true);
  }, [searchCriteria, sortBy]);

  const fetchResults = async (pageToFetch = 0, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setIsOfflineMode(false);

    try {
      const response = await searchPublicationsApi({
        type: searchCriteria.type,
        category: searchCriteria.category,
        query: searchCriteria.query,
        barrio: searchCriteria.barrio,
        dateFilter: searchCriteria.dateFilter,
        lat: searchCriteria.lat,
        lng: searchCriteria.lng,
        sortBy,
        page: pageToFetch,
        size: 10,
      });

      const newContent = response.content || [];

      if (pageToFetch === 0) {
        setPublications(newContent);
        // Save to offline cache
        await saveSearchCacheOffline(newContent);
      } else {
        setPublications((prev) => [...prev, ...newContent]);
      }

      setPage(response.pageNumber || 0);
      setIsLastPage(response.last ?? true);
    } catch (error) {
      console.error('Network or search error:', error);
      // Fallback to offline cache
      if (pageToFetch === 0) {
        const cache = await getOfflineSearchCache();
        if (cache && cache.items) {
          setPublications(cache.items);
          setIsOfflineMode(true);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchResults(0, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !isLastPage && !isOfflineMode) {
      fetchResults(page + 1, false);
    }
  };

  const handleSelectCategoryFilter = (catId) => {
    setSearchCriteria((prev) => ({
      ...prev,
      category: prev.category === catId ? null : catId,
    }));
  };

  const targetTypeLabel =
    searchCriteria.type === PublicationType.LOST ? 'HALLAZGOS' : 'PÉRDIDAS';

  return (
    <View style={styles.container}>
      {/* App Top Bar */}
      <View style={styles.appHeader}>
        <View style={styles.brandContainer}>
          <LogoHallado size={28} color="#FFFFFF" />
          <Text style={styles.brandTitle}>Hallado</Text>
        </View>

        <Pressable
          style={styles.guidedSearchButtonHeader}
          onPress={() => setSearchModalVisible(true)}
        >
          <MaterialCommunityIcons name="tune-variant" size={18} color="#FFFFFF" />
          <Text style={styles.guidedSearchButtonText}>Buscador Guiado</Text>
        </Pressable>
      </View>

      {/* Main Search Banner / Launcher */}
      <Pressable
        style={styles.searchBanner}
        onPress={() => setSearchModalVisible(true)}
      >
        <View style={styles.searchBannerIconCircle}>
          <MaterialCommunityIcons
            name={
              searchCriteria.type === PublicationType.LOST
                ? 'magnify-expand'
                : 'hand-heart'
            }
            size={22}
            color={Colors.primary || '#6D28D9'}
          />
        </View>

        <View style={styles.searchBannerTextContainer}>
          <Text style={styles.searchBannerTitle}>
            Buscando {targetTypeLabel}
          </Text>
          <Text style={styles.searchBannerSubtitle} numberOfLines={1}>
            {searchCriteria.barrio ? `en ${searchCriteria.barrio}` : 'en Todos los barrios'}
            {searchCriteria.category ? ` • ${getCategoryLabel(searchCriteria.category)}` : ''}
            {searchCriteria.query ? ` • "${searchCriteria.query}"` : ''}
          </Text>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
      </Pressable>

      {/* Offline Warning Banner */}
      {isOfflineMode && (
        <View style={styles.offlineBanner}>
          <MaterialCommunityIcons name="wifi-off" size={16} color="#B45309" />
          <Text style={styles.offlineBannerText}>
            Sin conexión: Mostrando últimos resultados guardados
          </Text>
        </View>
      )}

      {/* Filter Refinement Bar */}
      <View style={styles.filterRefineSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRefineScroll}
        >
          {/* Sort Option Toggle */}
          <Pressable
            style={[
              styles.filterChip,
              sortBy === 'distance' && styles.filterChipActive,
            ]}
            onPress={() => setSortBy(sortBy === 'recent' ? 'distance' : 'recent')}
          >
            <MaterialCommunityIcons
              name={sortBy === 'distance' ? 'map-marker-distance' : 'clock-outline'}
              size={14}
              color={sortBy === 'distance' ? '#FFFFFF' : '#374151'}
            />
            <Text
              style={[
                styles.filterChipText,
                sortBy === 'distance' && styles.textWhite,
              ]}
            >
              {sortBy === 'distance' ? 'Por Cercanía' : 'Por Fecha'}
            </Text>
          </Pressable>

          {/* Quick Category Chips */}
          {CATEGORY_OPTIONS.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.filterChip,
                searchCriteria.category === cat.id && styles.filterChipActive,
              ]}
              onPress={() => handleSelectCategoryFilter(cat.id)}
            >
              <MaterialCommunityIcons
                name={cat.icon}
                size={14}
                color={
                  searchCriteria.category === cat.id
                    ? '#FFFFFF'
                    : Colors.primary || '#6D28D9'
                }
              />
              <Text
                style={[
                  styles.filterChipText,
                  searchCriteria.category === cat.id && styles.textWhite,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Results List or Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary || '#6D28D9'} />
          <Text style={styles.loadingText}>Buscando publicaciones...</Text>
        </View>
      ) : (
        <FlatList
          data={publications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PublicationCard
              publication={item}
              onPress={() => {
                // Navigate to Publication Detail (Point 4)
                router.push(`/(tabs)/profile`);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary || '#6D28D9']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <EmptySearchResults searchCriteria={searchCriteria} />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={Colors.primary || '#6D28D9'} />
              </View>
            ) : null
          }
        />
      )}

      {/* Guided Search Modal Component */}
      <GuidedSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        initialCriteria={searchCriteria}
        onApplySearch={(newCriteria) => setSearchCriteria(newCriteria)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary || '#6D28D9',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  guidedSearchButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  guidedSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchBannerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchBannerTextContainer: {
    flex: 1,
  },
  searchBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  searchBannerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  offlineBannerText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  filterRefineSection: {
    marginBottom: 8,
  },
  filterRefineScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primary || '#6D28D9',
    borderColor: Colors.primary || '#6D28D9',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
