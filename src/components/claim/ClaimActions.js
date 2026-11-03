import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';

export default function ClaimActions({
  claim,
  onAccept,
  onReject,
  isProcessing,
  isOfflineMode,
}) {
  return (
    <View style={styles.actionsFooter}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.rejectBtn]}
        onPress={() => onReject(claim.id)}
        disabled={isProcessing || isOfflineMode}
      >
        <Text style={styles.rejectBtnText}>Rechazar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.acceptBtn]}
        onPress={() => onAccept(claim.id)}
        disabled={isProcessing || isOfflineMode}
      >
        {isProcessing ? (
          <ActivityIndicator color={Colors.surface} size="small" />
        ) : (
          <Text style={styles.acceptBtnText}>Aceptar Reclamo</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsFooter: {
    flexDirection: 'row',
    padding: 14,
    paddingTop: 0,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
  },
  rejectBtnText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
  },
  acceptBtnText: {
    color: Colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },
});
