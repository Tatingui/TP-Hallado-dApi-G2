import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { MeetingStatus } from '../../constants/publicationConstants';

export default function MeetingSection({
  claim,
  counterpartName,
  getMeetingStatusText,
  onOpenDirections,
  onProposeMeeting,
  onAcceptMeeting,
  isProcessing,
}) {
  return (
    <View style={styles.meetingBox}>
      <View style={styles.meetingHeader}>
        <Ionicons name="location" size={16} color={Colors.primary} />
        <Text style={styles.meetingTitle}>Punto de encuentro</Text>
      </View>

      {claim.meetingAddress ? (
        <>
          <Text style={styles.meetingAddress}>{claim.meetingAddress}</Text>
          <Text
            style={[
              styles.meetingStatusText,
              claim.meetingStatus === MeetingStatus.ACCEPTED && styles.meetingStatusConfirmed,
            ]}
          >
            {getMeetingStatusText()}
          </Text>

          <TouchableOpacity
            style={[styles.actionBtn, styles.directionsBtn]}
            onPress={onOpenDirections}
          >
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
              <ActivityIndicator color={Colors.surface} size="small" />
            ) : (
              <Text style={styles.acceptBtnText}>Aceptar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  meetingBox: {
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: Colors.purple50,
    borderWidth: 1,
    borderColor: Colors.purple200,
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
    color: Colors.primary,
  },
  meetingAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray900,
    marginBottom: 2,
  },
  meetingStatusText: {
    fontSize: 12,
    color: Colors.gray500,
  },
  meetingStatusConfirmed: {
    color: Colors.successDark,
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
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
  },
  acceptBtnText: {
    color: Colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  suggestBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.purple200,
  },
  directionsBtn: {
    flex: 0,
    marginTop: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.purple200,
  },
  suggestBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
