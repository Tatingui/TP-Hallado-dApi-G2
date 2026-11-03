import React from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';
import { formatDateTime } from '../utils/date';
import ClaimActions from './claim/ClaimActions';
import ClaimContent from './claim/ClaimContent';
import ClaimHeader from './claim/ClaimHeader';
import MeetingSection from './claim/MeetingSection';

export default function ClaimCard({
  claim,
  type,
  onAccept,
  onReject,
  onProposeMeeting,
  onAcceptMeeting,
  isProcessing,
  isOfflineMode = false,
}) {
  if (!claim) return null;

  const isReceived = type === 'RECEIVED';
  const counterpartName =
    (isReceived ? claim.claimant?.name : claim.publisher?.name) || 'la otra persona';
  const isAccepted = claim.status === 'ACCEPTED';
  const isPending = claim.status === 'PENDING';

  const getMeetingStatusText = () => {
    if (claim.meetingStatus === 'ACCEPTED') return 'Confirmado por ambas partes';
    if (claim.meetingProposedByMe) return `Esperando respuesta de ${counterpartName}`;
    return `${counterpartName} propuso este lugar`;
  };

  const openDirections = async () => {
    const destination = encodeURIComponent(`${claim.meetingAddress}, Buenos Aires, Argentina`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&dir_action=navigate`;
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    }
  };

  return (
    <View style={styles.card}>
      <ClaimHeader claim={claim} formattedDate={formatDateTime(claim.claimDate)} />

      <ClaimContent claim={claim} isReceived={isReceived} isAccepted={isAccepted} />

      {isReceived && isPending && (
        <ClaimActions
          claim={claim}
          onAccept={onAccept}
          onReject={onReject}
          isProcessing={isProcessing}
          isOfflineMode={isOfflineMode}
        />
      )}

      {isAccepted && (
        <MeetingSection
          claim={claim}
          counterpartName={counterpartName}
          getMeetingStatusText={getMeetingStatusText}
          onOpenDirections={openDirections}
          onProposeMeeting={onProposeMeeting}
          onAcceptMeeting={onAcceptMeeting}
          isProcessing={isProcessing}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: 'hidden',
  },
});
