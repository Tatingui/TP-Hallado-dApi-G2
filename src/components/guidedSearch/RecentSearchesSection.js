import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  DATE_FILTER_OPTIONS,
  DateFilterOption,
  PublicationType,
  getCategoryLabel,
} from '../../constants/publicationConstants';
import { Colors } from '../../constants/theme';
import { formatDate, fromLocalDateString } from '../../utils/date';

/** "· Última semana" o "· 01/11/2026 a 03/11/2026" según el filtro de fecha guardado. */
function getDateLabel(item) {
  if (!item.dateFilter || item.dateFilter === DateFilterOption.ALL) return '';
  if (item.dateFilter === DateFilterOption.CUSTOM_RANGE) {
    const from = item.startDate ? formatDate(fromLocalDateString(item.startDate)) : '…';
    const to = item.endDate ? formatDate(fromLocalDateString(item.endDate)) : '…';
    return `· ${from} a ${to}`;
  }
  const option = DATE_FILTER_OPTIONS.find((opt) => opt.id === item.dateFilter);
  return option ? `· ${option.label}` : '';
}

export default function RecentSearchesSection({ recentSearches, onClear, onSelect }) {
  if (recentSearches.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Búsquedas Recientes</Text>
        <Pressable onPress={onClear}>
          <Text style={styles.clearText}>Borrar historial</Text>
        </Pressable>
      </View>

      <View style={styles.recentList}>
        {recentSearches.map((item) => (
          <Pressable key={item.id} style={styles.recentItem} onPress={() => onSelect(item)}>
            <MaterialCommunityIcons name="history" size={16} color={Colors.gray500} />
            <Text style={styles.recentText} numberOfLines={1}>
              {item.type === PublicationType.LOST ? 'Perdí ' : 'Encontré '}
              {item.category ? `${getCategoryLabel(item.category)} ` : ''}
              {item.query ? `"${item.query}" ` : ''}
              {item.barrio ? `en ${item.barrio} ` : ''}
              {getDateLabel(item)}
            </Text>
            <MaterialCommunityIcons name="arrow-top-left" size={16} color={Colors.gray400} />
          </Pressable>
        ))}
      </View>
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
});
