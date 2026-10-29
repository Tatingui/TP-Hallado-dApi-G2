import { StyleSheet, Text, View } from "react-native";
import { CATEGORY_OPTIONS, getTypeLabel } from "../../../constants/publicationConstants";
import { Colors } from "../../../constants/theme";

export default function StepReview({ form }) {
  return (
    <View>
      <Text style={styles.stepTitle}>Revisá tu publicación</Text>
      <View style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>Publicación</Text>
        <Text style={styles.reviewValue}>{getTypeLabel(form.type)}</Text>
        <Text style={styles.reviewLabel}>Categoría</Text>
        <Text style={styles.reviewValue}>
          {CATEGORY_OPTIONS.find((c) => c.id === form.category)?.label}
        </Text>
        <Text style={styles.reviewLabel}>Título</Text>
        <Text style={styles.reviewValue}>{form.title}</Text>
        <Text style={styles.reviewLabel}>Descripción</Text>
        <Text style={styles.reviewValue}>{form.description}</Text>
        <Text style={styles.reviewLabel}>Barrio</Text>
        <Text style={styles.reviewValue}>{form.barrio}</Text>
        {form.address ? (
          <>
            <Text style={styles.reviewLabel}>Dirección</Text>
            <Text style={styles.reviewValue}>{form.address}</Text>
          </>
        ) : null}
        {form.eventDate && (
          <>
            <Text style={styles.reviewLabel}>Fecha</Text>
            <Text style={styles.reviewValue}>
              {new Date(form.eventDate).toLocaleDateString("es-AR")}
            </Text>
          </>
        )}
        {form.images.length > 0 && (
          <>
            <Text style={styles.reviewLabel}>Fotos</Text>
            <Text style={styles.reviewValue}>
              {form.images.length} imagen(es)
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  reviewCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16 },
  reviewLabel: {
    fontSize: 12, fontWeight: "600", color: Colors.textSecondary,
    textTransform: "uppercase", marginTop: 12,
  },
  reviewValue: { fontSize: 15, color: Colors.text, marginTop: 2 },
});
