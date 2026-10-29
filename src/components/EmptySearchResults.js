import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, COLORS } from '../constants/theme';
import { useRouter } from 'expo-router';

export default function EmptySearchResults({ searchCriteria, onSaveAlert }) {
  const router = useRouter();

  const handlePublish = () => {
    // Navigate to Create Publication Wizard (Point 5)
    router.push('/(tabs)/profile'); // Or publish screen route
  };

  const handleSaveAlert = () => {
    if (onSaveAlert) {
      onSaveAlert(searchCriteria);
    } else {
      Alert.alert(
        'Alerta Guardada',
        'Te notificaremos cuando alguien publique algo que coincida con tus criterios de búsqueda.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="magnify-remove-outline" size={48} color={COLORS.primary || Colors.purple700} />
      </View>

      <Text style={styles.title}>No encontramos publicaciones</Text>
      <Text style={styles.subtitle}>
        No hay registros que coincidan exactamente con tus filtros en este momento.
      </Text>

      <View style={styles.actionsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handlePublish}
        >
          <MaterialCommunityIcons name="plus-circle" size={18} color=Colors.surface />
          <Text style={styles.primaryButtonText}>Publicar mi pérdida o hallazgo</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSaveAlert}
        >
          <MaterialCommunityIcons name="bell-plus" size={18} color={COLORS.primary || Colors.purple700} />
          <Text style={styles.secondaryButtonText}>Guardar búsqueda como alerta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginTop: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.purple100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary || Colors.purple700,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.purple100,
    borderWidth: 1,
    borderColor: Colors.purple200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: COLORS.primary || Colors.purple700,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
