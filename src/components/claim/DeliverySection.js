import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

/**
 * Cierre del reclamo aceptado. Al publicador le muestra "Confirmar entrega" y
 * "Cancelar reclamo" mientras la entrega está pendiente; a ambas partes, el aviso
 * de entrega confirmada una vez que la publicación quedó resuelta.
 */
export default function DeliverySection({
  claim,
  isDelivered,
  onConfirmDelivery,
  onCancelClaim,
  isProcessing,
  isOfflineMode,
}) {
  if (isDelivered) {
    return (
      <View style={styles.deliveredBox}>
        <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
        <Text style={styles.deliveredText}>Entrega confirmada: el caso está en el historial</Text>
      </View>
    );
  }

  const disabled = isProcessing || isOfflineMode;

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>¿Ya se concretó la devolución?</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.cancelBtn]}
          onPress={() => onCancelClaim(claim.id)}
          disabled={disabled}
        >
          <Text style={styles.cancelBtnText}>Cancelar reclamo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deliverBtn, disabled && styles.disabled]}
          onPress={() => onConfirmDelivery(claim.id)}
          disabled={disabled}
        >
          {isProcessing ? (
            <ActivityIndicator color={Colors.surface} size="small" />
          ) : (
            <Text style={styles.deliverBtnText}>Confirmar entrega</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    paddingTop: 0,
  },
  hint: {
    fontSize: 13,
    color: Colors.gray500,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: Colors.errorLight,
  },
  cancelBtnText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  deliverBtn: {
    backgroundColor: Colors.success,
  },
  deliverBtnText: {
    color: Colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  deliveredBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
  },
  deliveredText: {
    flex: 1,
    color: Colors.successDark,
    fontSize: 13,
    fontWeight: '600',
  },
});
