import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BARRIOS_LIST } from '../../constants/publicationConstants';
import { COLORS, Colors } from '../../constants/theme';

export default function SearchLocationSection({
  barrio,
  showBarrioPicker,
  userLocation,
  loadingLocation,
  onToggleBarrioPicker,
  onSelectBarrio,
  onGetCurrentLocation,
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. ¿Dónde ocurrió?</Text>
      <Pressable style={styles.pickerSelector} onPress={onToggleBarrioPicker}>
        <View style={styles.pickerSelectorLeft}>
          <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary || Colors.purple700} />
          <Text style={styles.pickerSelectorText}>{barrio}</Text>
        </View>
        <MaterialCommunityIcons
          name={showBarrioPicker ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.gray500}
        />
      </Pressable>

      {showBarrioPicker && (
        <View style={styles.barriosListContainer}>
          {BARRIOS_LIST.map((item) => (
            <Pressable
              key={item}
              style={[styles.barrioItem, barrio === item && styles.barrioItemActive]}
              onPress={() => onSelectBarrio(item)}
            >
              <Text style={[styles.barrioItemText, barrio === item && styles.barrioItemTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable style={styles.gpsButton} onPress={onGetCurrentLocation} disabled={loadingLocation}>
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
              {userLocation ? 'GPS Activado (Ordenará por cercanía)' : 'Usar mi ubicación actual'}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
