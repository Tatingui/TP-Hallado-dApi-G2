import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { ClaimStatusBadge } from '../StatusBadge';

export default function ClaimHeader({ claim, formattedDate }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.pubTitle} numberOfLines={1}>
          {claim.publicationTitle}
        </Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
      <ClaimStatusBadge status={claim.status} />
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
});
