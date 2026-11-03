import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { CATEGORY_OPTIONS } from '../../constants/publicationConstants';

/**
 * Barra horizontal para refinar resultados: limpiar filtros, guardar alerta (Punto 9),
 * alternar el orden (fecha/cercanía) y chips rápidos de categoría.
 */
export default function CategoryFilterBar({
  hasActiveFilters,
  onClearFilters,
  savingAlert,
  onSaveAlert,
  sortBy,
  onToggleSort,
  selectedCategory,
  onSelectCategory,
}) {
  return (
    <View style={styles.filterRefineSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRefineScroll}
      >
        {/* Limpiar filtros: solo si hay alguno aplicado */}
        {hasActiveFilters && (
          <Pressable style={styles.filterChip} onPress={onClearFilters}>
            <MaterialCommunityIcons name="filter-remove" size={14} color={Colors.error} />
            <Text style={[styles.filterChipText, { color: Colors.error }]}>Limpiar</Text>
          </Pressable>
        )}

        {/* Guardar búsqueda como alerta (Punto 9) */}
        <Pressable
          style={styles.filterChip}
          onPress={() => onSaveAlert()}
          disabled={savingAlert}
        >
          {savingAlert ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <MaterialCommunityIcons name="bell-plus" size={14} color={Colors.primary} />
          )}
          <Text style={styles.filterChipText}>Guardar alerta</Text>
        </Pressable>

        {/* Sort Option Toggle */}
        <Pressable
          style={[
            styles.filterChip,
            sortBy === 'distance' && styles.filterChipActive,
          ]}
          onPress={onToggleSort}
        >
          <MaterialCommunityIcons
            name={sortBy === 'distance' ? 'map-marker-distance' : 'clock-outline'}
            size={14}
            color={sortBy === 'distance' ? Colors.surface : Colors.gray700}
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
              selectedCategory === cat.id && styles.filterChipActive,
            ]}
            onPress={() => onSelectCategory(cat.id)}
          >
            <MaterialCommunityIcons
              name={cat.icon}
              size={14}
              color={
                selectedCategory === cat.id
                  ? Colors.surface
                  : Colors.primary
              }
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === cat.id && styles.textWhite,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray700,
  },
  textWhite: {
    color: Colors.surface,
  },
});
