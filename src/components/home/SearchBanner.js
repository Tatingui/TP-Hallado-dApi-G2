import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { PublicationType, getCategoryLabel } from '../../constants/publicationConstants';

/**
 * Banner que resume la búsqueda actual (tipo, barrio, categoría y palabras clave).
 * Al tocarlo se abre el Buscador Guiado.
 */
export default function SearchBanner({ searchCriteria, onPress }) {
  const targetTypeLabel =
    searchCriteria.type === PublicationType.LOST ? 'HALLAZGOS' : 'PÉRDIDAS';

  return (
    <Pressable
      style={styles.searchBanner}
      onPress={onPress}
    >
      <View style={styles.searchBannerIconCircle}>
        <MaterialCommunityIcons
          name={
            searchCriteria.type === PublicationType.LOST
              ? 'magnify-expand'
              : 'hand-heart'
          }
          size={22}
          color={Colors.primary}
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

      <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.gray400} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
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
    backgroundColor: Colors.purple100,
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
    color: Colors.gray900,
  },
  searchBannerSubtitle: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
});
