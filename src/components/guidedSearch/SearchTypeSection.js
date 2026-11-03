import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PublicationType } from '../../constants/publicationConstants';
import { Colors } from '../../constants/theme';

export default function SearchTypeSection({ type, onChangeType }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. ¿Qué te pasó?</Text>
      <View style={styles.typeToggleContainer}>
        <Pressable
          style={[styles.typeOption, type === PublicationType.LOST && styles.typeOptionActiveLost]}
          onPress={() => onChangeType(PublicationType.LOST)}
        >
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={20}
            color={type === PublicationType.LOST ? Colors.surface : Colors.gray700}
          />
          <Text style={[styles.typeOptionText, type === PublicationType.LOST && styles.textWhite]}>
            Perdí algo
          </Text>
        </Pressable>

        <Pressable
          style={[styles.typeOption, type === PublicationType.FOUND && styles.typeOptionActiveFound]}
          onPress={() => onChangeType(PublicationType.FOUND)}
        >
          <MaterialCommunityIcons
            name="hand-heart-outline"
            size={20}
            color={type === PublicationType.FOUND ? Colors.surface : Colors.gray700}
          />
          <Text style={[styles.typeOptionText, type === PublicationType.FOUND && styles.textWhite]}>
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
});
