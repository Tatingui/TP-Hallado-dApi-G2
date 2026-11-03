import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function GuidedSearchFooter({
  onSaveAlert,
  isSavingAlert,
  onSubmit,
  getSearchParams,
}) {
  return (
    <View style={styles.footer}>
      {onSaveAlert && (
        <Pressable
          style={({ pressed }) => [styles.saveAlertButton, pressed && styles.buttonPressed]}
          onPress={() => onSaveAlert(getSearchParams())}
          disabled={isSavingAlert}
        >
          {isSavingAlert ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <MaterialCommunityIcons
              name="bell-plus"
              size={20}
              color={Colors.primary}
            />
          )}
          <Text style={styles.saveAlertButtonText}>Guardar como alerta</Text>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [styles.submitButton, pressed && styles.buttonPressed]}
        onPress={onSubmit}
      >
        <MaterialCommunityIcons name="magnify" size={22} color={Colors.surface} />
        <Text style={styles.submitButtonText}>Buscar Publicaciones</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  submitButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  saveAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    marginBottom: 10,
    gap: 8,
  },
  saveAlertButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
