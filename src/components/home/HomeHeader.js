import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import LogoHallado from '../LogoHallado';

/**
 * Barra superior del inicio: marca de Hallado y botón para abrir el Buscador Guiado.
 */
export default function HomeHeader({ onOpenGuidedSearch }) {
  return (
    <View style={styles.appHeader}>
      <View style={styles.brandContainer}>
        <LogoHallado size={28} color={Colors.surface} />
        <Text style={styles.brandTitle}>Hallado</Text>
      </View>

      <Pressable
        style={styles.guidedSearchButtonHeader}
        onPress={onOpenGuidedSearch}
      >
        <MaterialCommunityIcons name="tune-variant" size={18} color={Colors.surface} />
        <Text style={styles.guidedSearchButtonText}>Buscador Guiado</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.surface,
    letterSpacing: 0.5,
  },
  guidedSearchButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  guidedSearchButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});
