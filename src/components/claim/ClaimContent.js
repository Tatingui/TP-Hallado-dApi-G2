import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { resolveImageUrl } from '../../utils/imageUrl';

export default function ClaimContent({ claim, isReceived, isAccepted }) {
  return (
    <View style={styles.body}>
      {claim.proofImageUrl ? (
        <Image source={{ uri: resolveImageUrl(claim.proofImageUrl) }} style={styles.proofImage} />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="image-outline" size={32} color={Colors.gray400} />
          <Text style={styles.noImageText}>Sin foto</Text>
        </View>
      )}

      <View style={styles.detailsContainer}>
        <Text style={styles.messageLabel}>
          {isReceived ? `Mensaje de ${claim.claimant?.name || 'Usuario'}:` : 'Tu mensaje:'}
        </Text>
        <Text style={styles.messageText} numberOfLines={3}>
          {claim.proofMessage || 'Sin descripción adicional.'}
        </Text>

        {isReceived && claim.verificationQuestion && (
          <View style={styles.verificationBox}>
            <Text style={styles.verificationLabel}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.purple700} /> Verificación
            </Text>
            <Text style={styles.verificationQuestion}>{claim.verificationQuestion}</Text>
            <View style={styles.verificationRow}>
              <View style={styles.verificationCol}>
                <Text style={styles.verificationSubLabel}>Respondió:</Text>
                <Text style={styles.verificationValue}>
                  {claim.verificationAnswer || '(sin respuesta)'}
                </Text>
              </View>
              <View style={styles.verificationCol}>
                <Text style={styles.verificationSubLabel}>Esperada:</Text>
                <Text style={styles.verificationExpected}>
                  {claim.expectedVerificationAnswer || '—'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {isAccepted && (
          <View style={styles.contactBox}>
            <Text style={styles.contactLabel}>Datos de Contacto:</Text>
            {isReceived ? (
              <Text style={styles.contactValue}>
                Tel: {claim.claimant?.phone || 'No configurado/oculto'}
              </Text>
            ) : (
              <>
                <Text style={styles.contactValue}>
                  Tel: {claim.publisher?.phone || 'No configurado/oculto'}
                </Text>
                <Text style={styles.contactValue} numberOfLines={2}>
                  Lugar: {claim.exactAddress || 'Contactar para acordar entrega'}
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  proofImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
  },
  noImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 10,
    color: Colors.gray400,
    marginTop: 4,
  },
  detailsContainer: {
    flex: 1,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: Colors.gray600,
    lineHeight: 18,
  },
  contactBox: {
    marginTop: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 8,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.successDark,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 12,
    color: Colors.successDark,
  },
  verificationBox: {
    marginTop: 10,
    backgroundColor: Colors.purple50,
    borderWidth: 1,
    borderColor: Colors.purple200,
    borderRadius: 8,
    padding: 10,
  },
  verificationLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.purple700,
    marginBottom: 4,
  },
  verificationQuestion: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray700,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  verificationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  verificationCol: {
    flex: 1,
  },
  verificationSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray500,
    marginBottom: 2,
  },
  verificationValue: {
    fontSize: 13,
    color: Colors.gray900,
    fontWeight: '600',
  },
  verificationExpected: {
    fontSize: 13,
    color: Colors.successDark,
    fontWeight: '600',
  },
});
