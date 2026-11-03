import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { formatDate } from "../../utils/date";

const TYPE_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "DEVOLVI", label: "Devolví" },
  { value: "RECUPERE", label: "Recuperé" },
];

/**
 * Barra de filtros del historial: tipo de caso (Devolví / Recuperé) y rango de fechas.
 * Al tocar una fecha avisa cuál picker abrir ("from" o "to").
 */
export default function HistoryFilters({ type, from, to, onTypeChange, onOpenPicker }) {
  return (
    <View style={styles.filters}>
      <Text style={styles.filterLabel}>Tipo de publicación</Text>
      <View style={styles.segment}>
        {TYPE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onTypeChange(option.value)}
            style={[
              styles.segmentButton,
              type === option.value && styles.activeSegment,
            ]}
          >
            <Text>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.dateRow}>
        <Pressable
          style={styles.dateButton}
          onPress={() => onOpenPicker("from")}
        >
          <Text>Desde: {from ? formatDate(from) : "cualquiera"}</Text>
        </Pressable>
        <Pressable style={styles.dateButton} onPress={() => onOpenPicker("to")}>
          <Text>Hasta: {to ? formatDate(to) : "cualquiera"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Colors.gray200,
  },
  filterLabel: {
    fontWeight: "700",
    marginBottom: 8,
    color: Colors.gray700,
  },
  segment: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: Colors.gray100,
    padding: 4,
    borderRadius: 8,
  },
  segmentButton: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeSegment: {
    backgroundColor: "#fff",
  },
  dateRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 10,
    borderRadius: 7,
  },
});
