import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DATE_FILTER_OPTIONS, DateFilterOption } from '../../constants/publicationConstants';
import { COLORS, Colors } from '../../constants/theme';
import { formatDate } from '../../utils/date';

/**
 * ¿Cuándo ocurrió? Con "Rango de fechas" muestra los botones Desde / Hasta;
 * al tocarlos avisa qué fecha elegir ("start" o "end").
 */
export default function SearchDateSection({ dateFilter, onChangeDateFilter, startDate, endDate, onOpenPicker }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>4. ¿Cuándo ocurrió?</Text>
      <View style={styles.dateOptionsGrid}>
        {DATE_FILTER_OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            style={[styles.dateOptionCard, dateFilter === opt.id && styles.dateOptionActive]}
            onPress={() => onChangeDateFilter(opt.id)}
          >
            <Text style={[styles.dateOptionText, dateFilter === opt.id && styles.textWhite]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {dateFilter === DateFilterOption.CUSTOM_RANGE && (
        <View style={styles.rangeRow}>
          {[
            { key: 'start', label: 'Desde', value: startDate },
            { key: 'end', label: 'Hasta', value: endDate },
          ].map(({ key, label, value }) => (
            <Pressable key={key} style={styles.rangeButton} onPress={() => onOpenPicker(key)}>
              <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary || Colors.purple700} />
              <Text style={styles.rangeButtonText}>
                {label}: {value ? formatDate(value) : 'elegir'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
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
  textWhite: {
    color: Colors.surface,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  rangeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.surface,
  },
  rangeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray700,
  },
});
