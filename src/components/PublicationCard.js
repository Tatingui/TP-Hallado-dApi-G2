import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { resolveImageUrl } from '../utils/imageUrl';
import {
  getCategoryLabel,
  getCategoryIcon,
  PublicationType,
} from '../constants/publicationConstants';

export default function PublicationCard({ publication, onPress }) {
  if (!publication) return null;

  const isFound = publication.type === PublicationType.FOUND;
  const categoryLabel = getCategoryLabel(publication.category);
  const categoryIcon = getCategoryIcon(publication.category);

  // Format date
  const formattedDate = publication.eventDate
    ? new Date(publication.eventDate).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Fecha no especificada';

  // Primary image — si la URL es relativa, le agregamos la base del servidor
  const rawUrl =
    publication.imageUrls && publication.imageUrls.length > 0
      ? publication.imageUrls[0]
      : null;
  const imageUrl = rawUrl
    ? (resolveImageUrl(rawUrl))
    : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, { alignItems: "center", justifyContent: "center", backgroundColor: "#F3E8FF" }]}>
            <MaterialCommunityIcons name="image-off-outline" size={40} color="#D1D5DB" />
          </View>
        )}

        {/* Type Badge */}
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: isFound ? '#10B981' : '#EF4444' },
          ]}
        >
          <MaterialCommunityIcons
            name={isFound ? 'hand-heart' : 'help-circle'}
            size={12}
            color="#FFF"
          />
          <Text style={styles.typeBadgeText}>
            {isFound ? 'ENCONTRADO' : 'PERDIDO'}
          </Text>
        </View>

        {/* Distance Badge if available */}
        {publication.distanceKm != null && (
          <View style={styles.distanceBadge}>
            <MaterialCommunityIcons name="map-marker-distance" size={12} color="#FFF" />
            <Text style={styles.distanceBadgeText}>
              {publication.distanceKm} km
            </Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.categoryRow}>
          <View style={styles.categoryChip}>
            <MaterialCommunityIcons
              name={categoryIcon}
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>

          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar"
              size={12}
              color={COLORS.subtext || '#6B7280'}
            />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {publication.title}
        </Text>

        {publication.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {publication.description}
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {publication.barrio || 'Buenos Aires'}
            </Text>
          </View>

          {publication.publisher && (
            <View style={styles.publisherContainer}>
              <MaterialCommunityIcons name="account-circle" size={14} color="#6B7280" />
              <Text style={styles.publisherName} numberOfLines={1}>
                {publication.publisher.nombre}
              </Text>
              {publication.publisher.devolucionesConcretadas >= 5 && (
                <View style={styles.badgeSolidario} title="Vecino Solidario">
                  <MaterialCommunityIcons name="star-circle" size={14} color="#F59E0B" />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    height: 160,
    width: '100%',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  distanceBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryText: {
    color: COLORS.primary || '#6D28D9',
    fontSize: 11,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#6B7280',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  publisherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  publisherName: {
    fontSize: 11,
    color: '#6B7280',
    maxWidth: 100,
  },
  badgeSolidario: {
    marginLeft: 2,
  },
});
