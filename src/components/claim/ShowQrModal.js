import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { modalStyles } from '../../constants/sharedStyles';

/**
 * Modal que muestra el código QR de entrega para la persona que devuelve el objeto.
 * La otra parte puede escanear este código o usar un QR físico con la misma información.
 */
export default function ShowQrModal({ visible, onClose, claim }) {
  if (!claim) return null;

  const qrData = JSON.stringify({
    claimId: claim.id,
    publicationId: claim.publicationId,
    type: 'HALLADO_DELIVERY',
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.gray600} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="qr-code-outline" size={36} color={Colors.primary} />
            <Text style={styles.title}>Código QR de Entrega</Text>
            <Text style={styles.subtitle}>
              Muestra este código a quien recupera el objeto para confirmar la entrega.
            </Text>
          </View>

          <View style={styles.qrContainer}>
            <QRCode value={qrData} size={210} color={Colors.text} backgroundColor={Colors.surface} />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              Código del Reclamo: <Text style={styles.codeText}>#{claim.id}</Text>
            </Text>
          </View>

          <Text style={styles.hintText}>
            También podés usar un código QR impreso físico con el identificador del reclamo.
          </Text>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: Colors.text,
  },
  codeText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  hintText: {
    fontSize: 12,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: 20,
  },

});
