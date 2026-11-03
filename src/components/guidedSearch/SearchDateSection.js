import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DATE_FILTER_OPTIONS } from '../../constants/publicationConstants';
import { COLORS, Colors } from '../../constants/theme';

export default function SearchDateSection({ dateFilter, onChangeDateFilter }) {
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
});
