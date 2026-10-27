import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { IMAGE_BASE_URL } from '../services/api';

export default function ClaimCard({ claim, type, onAccept, onReject, onProposeMeeting, onAcceptMeeting, isProcessing }) {
  if (!claim) return null;

  const isReceived = type === 'RECEIVED';
  const counterpartName = (isReceived ? claim.claimant?.name : claim.publisher?.name) || 'la otra persona';
  const isAccepted = claim.status === 'ACCEPTED';
  const isPending = claim.status === 'PENDING';
  const isRejected = claim.status === 'REJECTED';
  const isExpired = claim.status === 'EXPIRED';

  const getStatusColor = () => {
    if (isAccepted) return Colors.success || '#22C55E';
    if (isRejected) return '#EF4444';
    if (isExpired) return '#6B7280';
    return '#F59E0B'; // Pending
  };

  const getStatusText = () => {
    if (isAccepted) return 'Aceptado';
    if (isRejected) return 'Rechazado';
    if (isExpired) return 'Vencido';
    return 'Pendiente';
  };

  const getMeetingStatusText = () => {
    if (claim.meetingStatus === 'ACCEPTED') return 'Confirmado por ambas partes';
    if (claim.meetingProposedByMe) return `Esperando respuesta de ${counterpartName}`;
    return `${counterpartName} propuso este lugar`;
  };

  // Punto 8: Abre Google Maps (o el navegador) en modo navegación hacia el punto de encuentro
  const openDirections = async () => {
    // Se agrega la ciudad para que Maps no busque la calle en otra localidad
    const destination = encodeURIComponent(`${claim.meetingAddress}, Buenos Aires, Argentina`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&dir_action=navigate`;
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    }
  };

  const buildImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${IMAGE_BASE_URL}${url}`;
  };

  const formattedDate = new Date(claim.claimDate).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <View style={styles.card}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.pubTitle} numberOfLines={1}>
            {claim.publicationTitle}
          </Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.body}>
        {/* Foto Adjunta o Placeholder */}
        {claim.proofImageUrl ? (
          <Image source={{ uri: buildImageUrl(claim.proofImageUrl) }} style={styles.proofImage} />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
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

          {/* Si fue aceptado, mostrar datos de contacto (Punto 7 / 8) */}
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

      {/* Acciones del Publicador (Si es un reclamo recibido y está pendiente) */}
      {isReceived && isPending && (
        <View style={styles.actionsFooter}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => onReject(claim.id)}
            disabled={isProcessing}
          >
            <Text style={styles.rejectBtnText}>Rechazar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => onAccept(claim.id)}
            disabled={isProcessing}
          >
            {isProcessing ? (
               <ActivityIndicator color="#FFF" size="small" />
            ) : (
               <Text style={styles.acceptBtnText}>Aceptar Reclamo</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Punto de encuentro (Punto 8) */}
      {isAccepted && (
        <View style={styles.meetingBox}>
          <View style={styles.meetingHeader}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.meetingTitle}>Punto de encuentro</Text>
          </View>

          {claim.meetingAddress ? (
            <>
              <Text style={styles.meetingAddress}>{claim.meetingAddress}</Text>
              <Text style={[
                styles.meetingStatusText,
                claim.meetingStatus === 'ACCEPTED' && styles.meetingStatusConfirmed
              ]}>
                {getMeetingStatusText()}
              </Text>

              <TouchableOpacity style={[styles.actionBtn, styles.directionsBtn]} onPress={openDirections}>
                <Ionicons name="navigate" size={16} color={Colors.primary} />
                <Text style={styles.suggestBtnText}>Cómo llegar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.meetingStatusText}>
              {claim.canProposeMeeting
                ? 'Como tenés el objeto, proponé dónde encontrarse.'
                : `Esperando que ${counterpartName} proponga un lugar.`}
            </Text>
          )}

          {claim.canProposeMeeting && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn, styles.meetingBtn]}
              onPress={() => onProposeMeeting(claim)}
              disabled={isProcessing}
            >
              <Text style={styles.acceptBtnText}>Proponer punto de encuentro</Text>
            </TouchableOpacity>
          )}

          {claim.canRespondMeeting && (
            <View style={styles.meetingActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.suggestBtn]}
                onPress={() => onProposeMeeting(claim)}
                disabled={isProcessing}
              >
                <Text style={styles.suggestBtnText}>Sugerir otro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => onAcceptMeeting(claim.id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.acceptBtnText}>Aceptar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  pubTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  proofImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  noImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  detailsContainer: {
    flex: 1,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: '#4B5563',
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
    color: '#166534',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 12,
    color: '#15803D',
  },
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
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  acceptBtn: {
    backgroundColor: Colors.primary || '#6D28D9',
  },
  acceptBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  meetingBox: {
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 8,
    padding: 10,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  meetingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary || '#6D28D9',
  },
  meetingAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  meetingStatusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  meetingStatusConfirmed: {
    color: '#15803D',
    fontWeight: '600',
  },
  meetingBtn: {
    flex: 0,
    marginTop: 10,
  },
  meetingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  suggestBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  directionsBtn: {
    flex: 0,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  suggestBtnText: {
    color: Colors.primary || '#6D28D9',
    fontWeight: '600',
    fontSize: 14,
  }
});
