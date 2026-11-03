import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function GuidedSearchHeader({ onClose }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Buscador Guiado</Text>
      <Pressable style={styles.closeButton} onPress={onClose}>
        <MaterialCommunityIcons name="close" size={24} color={Colors.gray700} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.gray900,
  },
  closeButton: {
    padding: 6,
  },
});
