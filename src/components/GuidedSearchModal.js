import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, COLORS } from '../constants/theme';
import {
  PublicationType,
  CATEGORY_OPTIONS,
  DATE_FILTER_OPTIONS,
  BARRIOS_LIST,
  getCategoryLabel,
} from '../constants/publicationConstants';
import {
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
} from '../storage/recentSearchesStorage';

export default function GuidedSearchModal({
  visible,
  onClose,
  onApplySearch,
  onSaveAlert, // Punto 9 (opcional): guardar los criterios elegidos como alerta
  isSavingAlert = false,
  initialCriteria = {},
}) {
  const [type, setType] = useState(initialCriteria.type || PublicationType.LOST);
  const [category, setCategory] = useState(initialCriteria.category || null);
  const [query, setQuery] = useState(initialCriteria.query || '');
  const [barrio, setBarrio] = useState(initialCriteria.barrio || 'Todos los barrios');
  const [dateFilter, setDateFilter] = useState(initialCriteria.dateFilter || 'ALL');
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [recentSearches, setRecentSearches] = useState([]);
  const [showBarrioPicker, setShowBarrioPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      loadRecentSearches();
      // Mostrar los criterios aplicados en Inicio (pueden haber cambiado con los chips o "Limpiar")
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

  const loadRecentSearches = async () => {
    const list = await getRecentSearches();
    setRecentSearches(list);
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'No pudimos acceder a tu ubicación. Podés seleccionar tu barrio manualmente de la lista.'
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      Alert.alert(
        'Ubicación obtenida',
        'Usaremos tus coordenadas GPS actuales para ordenar y filtrar los resultados por cercanía.'
      );
    } catch (error) {
      console.error('Error getting position:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSelectRecentSearch = (item) => {
    setType(item.type || PublicationType.LOST);
    setCategory(item.category || null);
    setQuery(item.query || '');
    setBarrio(item.barrio || 'Todos los barrios');
    setDateFilter(item.dateFilter || 'ALL');
  };

  const handleClearRecent = async () => {
    await clearRecentSearches();
    setRecentSearches([]);
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

    // Save search to recent searches AsyncStorage
    await saveRecentSearch(searchParams);

    onApplySearch(searchParams);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Buscador Guiado</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color=Colors.gray700 />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* STEP 1: ¿Qué te pasó? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. ¿Qué te pasó?</Text>
            <View style={styles.typeToggleContainer}>
              <Pressable
                style={[
                  styles.typeOption,
                  type === PublicationType.LOST && styles.typeOptionActiveLost,
                ]}
                onPress={() => setType(PublicationType.LOST)}
              >
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={20}
                  color={type === PublicationType.LOST ? Colors.surface : Colors.gray700}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    type === PublicationType.LOST && styles.textWhite,
                  ]}
                >
                  Perdí algo
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.typeOption,
                  type === PublicationType.FOUND && styles.typeOptionActiveFound,
                ]}
                onPress={() => setType(PublicationType.FOUND)}
              >
                <MaterialCommunityIcons
                  name="hand-heart-outline"
                  size={20}
                  color={type === PublicationType.FOUND ? Colors.surface : Colors.gray700}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    type === PublicationType.FOUND && styles.textWhite,
                  ]}
                >
                  Encontré algo
                </Text>
              </Pressable>
            </View>

            <Text style={styles.typeHint}>
              {type === PublicationType.LOST
                ? '🔍 Buscaremos lo que otras personas ENCONTRARON para vos.'
                : '🔍 Buscaremos publicaciones de personas que PERDIERON algo.'}
            </Text>
          </View>

          {/* STEP 2: ¿Qué es? (Categoría & Palabras Clave) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. ¿Qué es?</Text>

            {/* Category Chips */}
            <Text style={styles.label}>Seleccioná una categoría:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <Pressable
                style={[
                  styles.chip,
                  category === null && styles.chipActive,
                ]}
                onPress={() => setCategory(null)}
              >
                <Text style={[styles.chipText, category === null && styles.textWhite]}>
                  Todas
                </Text>
              </Pressable>

              {CATEGORY_OPTIONS.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.chip,
                    category === cat.id && styles.chipActive,
                  ]}
                  onPress={() => setCategory(category === cat.id ? null : cat.id)}
                >
                  <MaterialCommunityIcons
                    name={cat.icon}
                    size={16}
                    color={category === cat.id ? Colors.surface : COLORS.primary || Colors.purple700}
                  />
                  <Text style={[styles.chipText, category === cat.id && styles.textWhite]}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Keyword Input */}
            <Text style={[styles.label, { marginTop: 12 }]}>Palabras clave (opcional):</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color=Colors.gray400 />
              <TextInput
                style={styles.input}
                placeholder="Ej. Mochila Nike, Caniche, Llave de auto..."
                value={query}
                onChangeText={setQuery}
              />
              {query ? (
                <Pressable onPress={() => setQuery('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color=Colors.gray400 />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* STEP 3: ¿Dónde? (Barrio / Ubicación) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. ¿Dónde ocurrió?</Text>

            <Pressable
              style={styles.pickerSelector}
              onPress={() => setShowBarrioPicker(!showBarrioPicker)}
            >
              <View style={styles.pickerSelectorLeft}>
                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary || Colors.purple700} />
                <Text style={styles.pickerSelectorText}>{barrio}</Text>
              </View>
              <MaterialCommunityIcons
                name={showBarrioPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color=Colors.gray500
              />
            </Pressable>

            {showBarrioPicker && (
              <View style={styles.barriosListContainer}>
                {BARRIOS_LIST.map((item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.barrioItem,
                      barrio === item && styles.barrioItemActive,
                    ]}
                    onPress={() => {
                      setBarrio(item);
                      setShowBarrioPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.barrioItemText,
                        barrio === item && styles.barrioItemTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Pressable
              style={styles.gpsButton}
              onPress={handleGetCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color={COLORS.primary || Colors.purple700} />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={userLocation ? 'crosshairs-gps' : 'navigation'}
                    size={18}
                    color={COLORS.primary || Colors.purple700}
                  />
                  <Text style={styles.gpsButtonText}>
                    {userLocation
                      ? 'GPS Activado (Ordenará por cercanía)'
                      : 'Usar mi ubicación actual'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* STEP 4: ¿Cuándo? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. ¿Cuándo ocurrió?</Text>
            <View style={styles.dateOptionsGrid}>
              {DATE_FILTER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.dateOptionCard,
                    dateFilter === opt.id && styles.dateOptionActive,
                  ]}
                  onPress={() => setDateFilter(opt.id)}
                >
                  <Text
                    style={[
                      styles.dateOptionText,
                      dateFilter === opt.id && styles.textWhite,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* RECENT SEARCHES */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Búsquedas Recientes</Text>
                <Pressable onPress={handleClearRecent}>
                  <Text style={styles.clearText}>Borrar historial</Text>
                </Pressable>
              </View>

              <View style={styles.recentList}>
                {recentSearches.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.recentItem}
                    onPress={() => handleSelectRecentSearch(item)}
                  >
                    <MaterialCommunityIcons name="history" size={16} color=Colors.gray500 />
                    <Text style={styles.recentText} numberOfLines={1}>
                      {item.type === PublicationType.LOST ? 'Perdí ' : 'Encontré '}
                      {item.category ? `${getCategoryLabel(item.category)} ` : ''}
                      {item.query ? `"${item.query}" ` : ''}
                      {item.barrio ? `en ${item.barrio}` : ''}
                    </Text>
                    <MaterialCommunityIcons name="arrow-top-left" size={16} color=Colors.gray400 />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Search Submit Footer */}
        <View style={styles.footer}>
          {onSaveAlert && (
            <Pressable
              style={({ pressed }) => [
                styles.saveAlertButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => onSaveAlert(buildSearchParams())}
              disabled={isSavingAlert}
            >
              {isSavingAlert ? (
                <ActivityIndicator size="small" color={COLORS.primary || Colors.purple700} />
              ) : (
                <MaterialCommunityIcons name="bell-plus" size={20} color={COLORS.primary || Colors.purple700} />
              )}
              <Text style={styles.saveAlertButtonText}>Guardar como alerta</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSubmitSearch}
          >
            <MaterialCommunityIcons name="magnify" size={22} color=Colors.surface />
            <Text style={styles.submitButtonText}>Buscar Publicaciones</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.gray900,
  },
  closeButton: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 12,
  },
  typeToggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    backgroundColor: Colors.gray50,
    gap: 8,
  },
  typeOptionActiveLost: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  typeOptionActiveFound: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray700,
  },
  textWhite: {
    color: Colors.surface,
  },
  typeHint: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 10,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray600,
    marginBottom: 8,
  },
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.purple200,
    backgroundColor: Colors.purple100,
    marginRight: 8,
    gap: 6,
  },
  chipActive: {
    backgroundColor: COLORS.primary || Colors.purple700,
    borderColor: COLORS.primary || Colors.purple700,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary || Colors.purple700,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray900,
  },
  pickerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray900,
  },
  barriosListContainer: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: Colors.surface,
  },
  barrioItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  barrioItemActive: {
    backgroundColor: Colors.purple100,
  },
  barrioItemText: {
    fontSize: 13,
    color: Colors.gray700,
  },
  barrioItemTextActive: {
    fontWeight: '700',
    color: COLORS.primary || Colors.purple700,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: Colors.purple100,
    borderWidth: 1,
    borderColor: Colors.purple200,
    gap: 8,
  },
  gpsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary || Colors.purple700,
  },
  dateOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateOptionCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray50,
  },
  dateOptionActive: {
    backgroundColor: COLORS.primary || Colors.purple700,
    borderColor: COLORS.primary || Colors.purple700,
  },
  dateOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray700,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray100,
    gap: 8,
  },
  recentText: {
    flex: 1,
    fontSize: 12,
    color: Colors.gray600,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  submitButton: {
    backgroundColor: COLORS.primary || Colors.purple700,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  submitButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  saveAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary || Colors.purple700,
    backgroundColor: Colors.surface,
    marginBottom: 10,
    gap: 8,
  },
  saveAlertButtonText: {
    color: COLORS.primary || Colors.purple700,
    fontSize: 15,
    fontWeight: '700',
  },
});
