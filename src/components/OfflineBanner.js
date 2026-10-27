import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../constants/theme';

export default function OfflineBanner({
  message = 'Modo Sin Conexión: La información podría no estar actualizada',
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons name="wifi-off" size={18} color="#B45309" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    borderRadius: 8,
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: FontSize.sm,
    color: '#92400E',
    fontWeight: '500',
  },
});
