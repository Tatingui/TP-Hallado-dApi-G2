import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/theme";
import {
  getClaimStatusColor,
  getClaimStatusLabel,
  getPublicationStatusColor,
  getStatusLabel,
} from "../constants/publicationConstants";

/**
 * Etiqueta de color con un estado. Las variantes de abajo resuelven
 * el texto y el color según el tipo de estado.
 */
export default function StatusBadge({ label, color, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

/** Estado de una publicación (abierta, en reclamo, resuelta, vencida o pendiente de envío). */
export function PublicationStatusBadge({ status, label, style }) {
  return (
    <StatusBadge
      label={label ?? getStatusLabel(status)}
      color={getPublicationStatusColor(status)}
      style={style}
    />
  );
}

/** Estado de un reclamo (pendiente, aceptado, rechazado o vencido). */
export function ClaimStatusBadge({ status, style }) {
  return (
    <StatusBadge
      label={getClaimStatusLabel(status)}
      color={getClaimStatusColor(status)}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    color: Colors.surface,
    fontSize: 11,
    fontWeight: "700",
  },
});
