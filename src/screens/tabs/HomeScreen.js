import { usePublications } from '../../hooks/usePublications';
import useSaveSearchAlert from '../../hooks/useSaveSearchAlert';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/theme';
import GuidedSearchModal from '../../components/GuidedSearchModal';
import OfflineBanner from '../../components/OfflineBanner';
import HomeHeader from '../../components/home/HomeHeader';
import SearchBanner from '../../components/home/SearchBanner';
import CategoryFilterBar from '../../components/home/CategoryFilterBar';
import SearchResultsList from '../../components/home/SearchResultsList';
import { PublicationType } from '../../constants/publicationConstants';

export default function HomeScreen() {
  const navigation = useNavigation();

  // Guided Search State
  const [searchModalVisible, setSearchModalVisible] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState({
    type: PublicationType.LOST, // User condition: LOST -> target search FOUND
    category: null,
    query: '',
    barrio: '',
    dateFilter: 'ALL',
    lat: null,
    lng: null,
  });

  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const { savingAlert, saveAlert } = useSaveSearchAlert();
  const [refreshing, setRefreshing] = useState(false);
  const { publications, loading, isOfflineMode, refetch, loadMore, error } = usePublications({ ...searchCriteria, sortBy }, hasSearched);
  const loadingMore = loading && publications.length > 0;
  useEffect(() => { if (error) Alert.alert('No se pudo buscar', error.message || 'Revisá los filtros o la sesión.'); }, [error]);
  const handleRefresh = async () => {
    // Antes de la primera búsqueda, refrescar equivale a buscar con los criterios actuales.
    if (!hasSearched) { setHasSearched(true); return; }
    setRefreshing(true);
    try { await refetch(); } finally { setRefreshing(false); }
  };
  const handleLoadMore = () => loadMore();

  // Refinar los filtros desde los resultados cuenta como una búsqueda (Punto 3).
  const handleSelectCategoryFilter = (catId) => {
    setHasSearched(true);
    setSearchCriteria((prev) => ({
      ...prev,
      category: prev.category === catId ? null : catId,
    }));
  };

  // Punto 9: Guardar una búsqueda como alerta (la actual o la armada en el Buscador Guiado)
  const handleSaveAlert = (criteria = searchCriteria) => saveAlert(criteria);

  const handleToggleSort = () => {
    if (sortBy === 'recent' && searchCriteria.lat == null) {
      Alert.alert('Ubicación necesaria', 'Para ordenar por cercanía, activá "Usar mi ubicación actual" en el Buscador Guiado.');
      return;
    }
    setSortBy(sortBy === 'recent' ? 'distance' : 'recent');
  };

  const openGuidedSearch = () => setSearchModalVisible(true);

  // Volver a la búsqueda por defecto (sin filtros), manteniendo el tipo elegido
  const hasActiveFilters = !!(
    searchCriteria.category ||
    searchCriteria.query ||
    searchCriteria.barrio ||
    (searchCriteria.dateFilter && searchCriteria.dateFilter !== 'ALL') ||
    searchCriteria.lat != null
  );

  const handleClearFilters = () => {
    setSortBy('recent');
    setSearchCriteria((prev) => ({
      type: prev.type,
      category: null,
      query: '',
      barrio: '',
      dateFilter: 'ALL',
      lat: null,
      lng: null,
    }));
  };

  return (
    <View style={styles.container}>
      {/* App Top Bar */}
      <HomeHeader onOpenGuidedSearch={openGuidedSearch} />

      {/* Main Search Banner / Launcher */}
      <SearchBanner searchCriteria={searchCriteria} onPress={openGuidedSearch} />

      {/* Offline Warning Banner */}
      {isOfflineMode && (
        <OfflineBanner message="Sin conexión: Mostrando últimos resultados cargados exitosamente (La información podría no estar actualizada)" />
      )}

      {/* Filter Refinement Bar */}
      <CategoryFilterBar
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        savingAlert={savingAlert}
        onSaveAlert={handleSaveAlert}
        sortBy={sortBy}
        onToggleSort={handleToggleSort}
        selectedCategory={searchCriteria.category}
        onSelectCategory={handleSelectCategoryFilter}
      />

      {/* Results List or Loading */}
      <SearchResultsList
        loading={loading}
        loadingMore={loadingMore}
        publications={publications}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        hasSearched={hasSearched}
        searchCriteria={searchCriteria}
        onSaveAlert={handleSaveAlert}
        onStartSearch={openGuidedSearch}
        onPressPublication={(item) => {
          // Navigate to Publication Detail (Point 4)
          navigation.navigate("PublicationDetail", { id: String(item.id) });
        }}
      />

      {/* Guided Search Modal Component */}
      <GuidedSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        initialCriteria={searchCriteria}
        onApplySearch={(newCriteria) => {
          setHasSearched(true);
          setSearchCriteria(newCriteria);
          // Con ubicación se ordena por cercanía; sin ella, por fecha.
          setSortBy(newCriteria.lat != null ? 'distance' : 'recent');
        }}
        onSaveAlert={handleSaveAlert}
        isSavingAlert={savingAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
});
