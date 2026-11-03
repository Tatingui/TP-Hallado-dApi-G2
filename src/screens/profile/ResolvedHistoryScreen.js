import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import useResolvedHistory from "../../hooks/useResolvedHistory";
import HistoryFilters from "../../components/history/HistoryFilters";
import ResolvedCaseCard from "../../components/history/ResolvedCaseCard";
import RatingModal from "../../components/history/RatingModal";


export default function ResolvedHistoryScreen() {
  const navigation = useNavigation();
  const {
    cases,
    loading,
    type,
    setType,
    from,
    setFrom,
    to,
    setTo,
    reload,
    rateCase,
  } = useResolvedHistory();
  const [picker, setPicker] = useState(null);
  const [selected, setSelected] = useState(null);
  const [positive, setPositive] = useState(true);
  const [message, setMessage] = useState("");
  const [thanks, setThanks] = useState("");

  const submitRating = async () => {
    const saved = await rateCase(selected, { positive, message, thanks });
    if (saved) {
      setSelected(null);
      setMessage("");
      setThanks("");
    }
  };

  const renderCase = ({ item }) => (
    <ResolvedCaseCard
      item={item}
      onOpen={(caseItem) =>
        navigation.navigate("PublicationDetail", { id: String(caseItem.publicationId) })
      }
      onRate={setSelected}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Casos resueltos</Text>
      </View>
      <HistoryFilters
        type={type}
        from={from}
        to={to}
        onTypeChange={setType}
        onOpenPicker={setPicker}
      />
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
        onRefresh={reload}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Todavía no tenés casos resueltos con estos filtros.
          </Text>
        }
      />
      <RatingModal
        selected={selected}
        positive={positive}
        onChangePositive={setPositive}
        message={message}
        onChangeMessage={setMessage}
        thanks={thanks}
        onChangeThanks={setThanks}
        onSubmit={submitRating}
        onClose={() => setSelected(null)}
      />
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
  empty: {
    textAlign: "center",
    marginTop: 60,
    color: Colors.gray500,
  },
});
