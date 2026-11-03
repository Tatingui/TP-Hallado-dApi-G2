import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, View } from 'react-native';
import useLocation from '../hooks/useLocation';
import useRecentSearches from '../hooks/useRecentSearches';
import { PublicationType } from '../constants/publicationConstants';
import { Colors } from '../constants/theme';
import GuidedSearchFooter from './guidedSearch/GuidedSearchFooter';
import GuidedSearchHeader from './guidedSearch/GuidedSearchHeader';
import RecentSearchesSection from './guidedSearch/RecentSearchesSection';
import SearchDateSection from './guidedSearch/SearchDateSection';
import SearchDetailsSection from './guidedSearch/SearchDetailsSection';
import SearchLocationSection from './guidedSearch/SearchLocationSection';
import SearchTypeSection from './guidedSearch/SearchTypeSection';

export default function GuidedSearchModal({
  visible,
  onClose,
  onApplySearch,
  onSaveAlert,
  isSavingAlert = false,
  initialCriteria = {},
}) {
  const [type, setType] = useState(initialCriteria.type || PublicationType.LOST);
  const [category, setCategory] = useState(initialCriteria.category || null);
  const [query, setQuery] = useState(initialCriteria.query || '');
  const [barrio, setBarrio] = useState(initialCriteria.barrio || 'Todos los barrios');
  const [dateFilter, setDateFilter] = useState(initialCriteria.dateFilter || 'ALL');
  const {
    location: userLocation,
    loading: loadingLocation,
    getLocation,
    setLocation: setUserLocation,
  } = useLocation();
  const {
    recentSearches,
    loadRecentSearches,
    addRecentSearch,
    clearRecent,
  } = useRecentSearches();
  const [showBarrioPicker, setShowBarrioPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      loadRecentSearches();
      setType(initialCriteria.type || PublicationType.LOST);
      setCategory(initialCriteria.category || null);
      setQuery(initialCriteria.query || '');
      setBarrio(initialCriteria.barrio || 'Todos los barrios');
      setDateFilter(initialCriteria.dateFilter || 'ALL');
      setUserLocation(
        initialCriteria.lat != null
          ? { latitude: initialCriteria.lat, longitude: initialCriteria.lng }
          : null
      );
    }
  }, [visible]);

  const handleGetCurrentLocation = async () => {
    try {
      const currentLocation = await getLocation();
      if (!currentLocation) {
        Alert.alert(
          'Permiso denegado',
          'No pudimos acceder a tu ubicación. Podés seleccionar tu barrio manualmente de la lista.'
        );
        return;
      }

      Alert.alert(
        'Ubicación obtenida',
        'Usaremos tus coordenadas GPS actuales para ordenar y filtrar los resultados por cercanía.'
      );
    } catch (error) {
      console.error('Error getting position:', error);
      Alert.alert('Error', error?.message || 'No se pudo obtener la ubicación actual.');
    }
  };

  const handleSelectRecentSearch = (item) => {
    setType(item.type || PublicationType.LOST);
    setCategory(item.category || null);
    setQuery(item.query || '');
    setBarrio(item.barrio || 'Todos los barrios');
    setDateFilter(item.dateFilter || 'ALL');
  };

  const buildSearchParams = () => ({
    type,
    category,
    query: query.trim(),
    barrio: barrio === 'Todos los barrios' ? '' : barrio,
    dateFilter,
    lat: userLocation ? userLocation.latitude : null,
    lng: userLocation ? userLocation.longitude : null,
  });

  const handleSubmitSearch = async () => {
    const searchParams = buildSearchParams();
    await addRecentSearch(searchParams);
    onApplySearch(searchParams);
    onClose();
  };

  const handleSelectBarrio = (selectedBarrio) => {
    setBarrio(selectedBarrio);
    setShowBarrioPicker(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <GuidedSearchHeader onClose={onClose} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SearchTypeSection type={type} onChangeType={setType} />
          <SearchDetailsSection
            category={category}
            query={query}
            onChangeCategory={setCategory}
            onChangeQuery={setQuery}
          />
          <SearchLocationSection
            barrio={barrio}
            showBarrioPicker={showBarrioPicker}
            userLocation={userLocation}
            loadingLocation={loadingLocation}
            onToggleBarrioPicker={() => setShowBarrioPicker((isOpen) => !isOpen)}
            onSelectBarrio={handleSelectBarrio}
            onGetCurrentLocation={handleGetCurrentLocation}
          />
          <SearchDateSection dateFilter={dateFilter} onChangeDateFilter={setDateFilter} />
          <RecentSearchesSection
            recentSearches={recentSearches}
            onClear={clearRecent}
            onSelect={handleSelectRecentSearch}
          />
        </ScrollView>

        <GuidedSearchFooter
          onSaveAlert={onSaveAlert}
          isSavingAlert={isSavingAlert}
          onSubmit={handleSubmitSearch}
          getSearchParams={buildSearchParams}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
});
