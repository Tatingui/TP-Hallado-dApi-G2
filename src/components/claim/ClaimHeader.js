import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { getClaimStatusColor, getClaimStatusLabel } from '../../constants/publicationConstants';

export default function ClaimHeader({ claim, formattedDate }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.pubTitle} numberOfLines={1}>
          {claim.publicationTitle}
        </Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getClaimStatusColor(claim.status) }]}>
        <Text style={styles.statusText}>{getClaimStatusLabel(claim.status)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  pubTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: Colors.gray500,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.surface,
    fontSize: 11,
    fontWeight: '700',
  },
});
