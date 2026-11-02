import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import {
  getResolvedHistoryApi,
  rateResolvedCaseApi,
} from "../../services/claimService";

const formatDate = (date) => date.toISOString().slice(0, 10);
const displayDate = (value) =>
  value ? new Date(value).toLocaleDateString("es-AR") : "-";

export default function ResolvedHistoryScreen() {
  const [cases, setCases] = useState([]);
  const [type, setType] = useState("ALL");
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [picker, setPicker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [positive, setPositive] = useState(true);
  const [message, setMessage] = useState("");
  const [thanks, setThanks] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCases(
        await getResolvedHistoryApi({
          type,
          from: from && formatDate(from),
          to: to && formatDate(to),
        }),
      );
    } catch (error) {
      Alert.alert("Error", error?.message || "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, [type, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const submitRating = async () => {
    try {
      await rateResolvedCaseApi(selected.claimId, {
        positive,
        message,
        publicThanks: selected.canThank ? thanks : null,
      });
      setSelected(null);
      setMessage("");
      setThanks("");
      load();
    } catch (error) {
      Alert.alert(
        "No se pudo guardar",
        error?.message || "Intentá nuevamente.",
      );
    }
  };

  const renderCase = ({ item }) => (
    <View style={styles.card}>
      <Pressable
        onPress={() => router.push(`/publication/${item.publicationId}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.publicationTitle}
          </Text>
          <Ionicons name="open-outline" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.meta}>
          {item.role === "DEVOLVI" ? "Devolví" : "Recuperé"} ·{" "}
          {displayDate(item.resolvedAt)}
        </Text>
        <Text style={styles.counterpart}>
          Contraparte: {item.counterpartName}
        </Text>
        {item.ratingMessage ? (
          <View style={styles.ratingMessage}>
            <Ionicons name="chatbubble-outline" size={15} color={Colors.primary} />
            <Text style={styles.ratingMessageText}>{item.ratingMessage}</Text>
          </View>
        ) : null}
      </Pressable>
      {item.canRate ? (
        <Pressable style={styles.rateButton} onPress={() => setSelected(item)}>
          <Ionicons name="star-outline" size={17} color="#fff" />
          <Text style={styles.rateButtonText}>Valorar caso</Text>
        </Pressable>
      ) : (
        <Text style={styles.rated}>
          {item.rated
            ? "Ya valoraste este caso"
            : "Plazo de valoración vencido"}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Casos resueltos</Text>
      </View>
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Tipo de publicación</Text>
        <View style={styles.segment}>
          <Pressable
            onPress={() => setType("ALL")}
            style={[
              styles.segmentButton,
              type === "ALL" && styles.activeSegment,
            ]}
          >
            <Text>Todos</Text>
          </Pressable>
          <Pressable
            onPress={() => setType("LOST")}
            style={[
              styles.segmentButton,
              type === "LOST" && styles.activeSegment,
            ]}
          >
            <Text>Devolví</Text>
          </Pressable>
          <Pressable
            onPress={() => setType("FOUND")}
            style={[
              styles.segmentButton,
              type === "FOUND" && styles.activeSegment,
            ]}
          >
            <Text>Recuperé</Text>
          </Pressable>
        </View>
        <View style={styles.dateRow}>
          <Pressable
            style={styles.dateButton}
            onPress={() => setPicker("from")}
          >
            <Text>Desde: {from ? displayDate(from) : "cualquiera"}</Text>
          </Pressable>
          <Pressable style={styles.dateButton} onPress={() => setPicker("to")}>
            <Text>Hasta: {to ? displayDate(to) : "cualquiera"}</Text>
          </Pressable>
        </View>
      </View>
      {picker && (
        <DateTimePicker
          value={picker === "from" ? from || new Date() : to || new Date()}
          mode="date"
          onChange={(_, date) => {
            setPicker(null);
            if (date) picker === "from" ? setFrom(date) : setTo(date);
          }}
        />
      )}
      <SectionList
        sections={[
          {
            title: "Devolví",
            data: cases.filter((item) => item.role === "DEVOLVI"),
          },
          {
            title: "Recuperé",
            data: cases.filter((item) => item.role === "RECUPERE"),
          },
        ].filter((section) => section.data.length > 0)}
        renderItem={renderCase}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        keyExtractor={(item) => String(item.claimId)}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Todavía no tenés casos resueltos con estos filtros.
          </Text>
        }
      />
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Valorar a {selected?.counterpartName}
            </Text>
            <View style={styles.segment}>
              <Pressable
                onPress={() => setPositive(true)}
                style={positive && styles.activePositive}
              >
                <Text>Positiva</Text>
              </Pressable>
              <Pressable
                onPress={() => setPositive(false)}
                style={!positive && styles.activeNegative}
              >
                <Text>Negativa</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mensaje breve opcional"
              value={message}
              onChangeText={setMessage}
              maxLength={280}
              multiline
            />
            {selected?.canThank && (
              <TextInput
                style={styles.input}
                placeholder="Agradecimiento público opcional"
                value={thanks}
                onChangeText={setThanks}
                maxLength={280}
                multiline
              />
            )}
            <Pressable style={styles.submit} onPress={submitRating}>
              <Text style={styles.submitText}>Guardar valoración</Text>
            </Pressable>
            <Pressable onPress={() => setSelected(null)}>
              <Text style={styles.cancel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
  },
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
  list: {
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    fontWeight: "800",
    color: Colors.gray900,
  },
  meta: {
    color: Colors.primary,
    marginTop: 6,
    fontWeight: "600",
  },
  counterpart: {
    color: Colors.gray500,
    marginTop: 5,
  },
  ratingMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.purple50,
  },
  ratingMessageText: {
    flex: 1,
    color: Colors.gray600,
    fontSize: 13,
    lineHeight: 18,
  },
  rateButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 7,
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  rateButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  rated: {
    color: Colors.gray500,
    marginTop: 12,
    fontSize: 12,
  },
  empty: {
    textAlign: "center",
    marginTop: 60,
    color: Colors.gray500,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,.4)",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 14,
  },
  activePositive: {
    backgroundColor: "#DCFCE7",
    padding: 10,
    borderRadius: 6,
  },
  activeNegative: {
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    minHeight: 48,
  },
  submit: {
    backgroundColor: Colors.primary,
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 14,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
  cancel: {
    textAlign: "center",
    marginTop: 14,
    color: Colors.primary,
  },
});
