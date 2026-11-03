import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CATEGORY_OPTIONS } from '../../constants/publicationConstants';
import { COLORS, Colors } from '../../constants/theme';

export default function SearchDetailsSection({ category, query, onChangeCategory, onChangeQuery }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. ¿Qué es?</Text>
      <Text style={styles.label}>Seleccioná una categoría:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        <Pressable
          style={[styles.chip, category === null && styles.chipActive]}
          onPress={() => onChangeCategory(null)}
        >
          <Text style={[styles.chipText, category === null && styles.textWhite]}>Todas</Text>
        </Pressable>

        {CATEGORY_OPTIONS.map((cat) => (
          <Pressable
            key={cat.id}
            style={[styles.chip, category === cat.id && styles.chipActive]}
            onPress={() => onChangeCategory(category === cat.id ? null : cat.id)}
          >
            <MaterialCommunityIcons
              name={cat.icon}
              size={16}
              color={category === cat.id ? Colors.surface : COLORS.primary || Colors.purple700}
            />
            <Text style={[styles.chipText, category === cat.id && styles.textWhite]}>{cat.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={[styles.label, styles.queryLabel]}>Palabras clave (opcional):</Text>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.gray400} />
        <TextInput
          style={styles.input}
          placeholder="Ej. Mochila Nike, Caniche, Llave de auto..."
          value={query}
          onChangeText={onChangeQuery}
        />
        {query ? (
          <Pressable onPress={() => onChangeQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={Colors.gray400} />
          </Pressable>
        ) : null}
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray600,
    marginBottom: 8,
  },
  queryLabel: {
    marginTop: 12,
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
  textWhite: {
    color: Colors.surface,
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
});
