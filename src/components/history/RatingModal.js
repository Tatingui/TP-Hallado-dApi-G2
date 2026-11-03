import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "../../constants/theme";

/**
 * Modal para valorar a la contraparte de un caso resuelto: positiva o
 * negativa, mensaje breve opcional y agradecimiento público (si aplica).
 */
export default function RatingModal({
  selected,
  positive,
  onChangePositive,
  message,
  onChangeMessage,
  thanks,
  onChangeThanks,
  onSubmit,
  onClose,
}) {
  return (
    <Modal
      visible={!!selected}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>
            Valorar a {selected?.counterpartName}
          </Text>
          <View style={styles.segment}>
            <Pressable
              onPress={() => onChangePositive(true)}
              style={positive && styles.activePositive}
            >
              <Text>Positiva</Text>
            </Pressable>
            <Pressable
              onPress={() => onChangePositive(false)}
              style={!positive && styles.activeNegative}
            >
              <Text>Negativa</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Mensaje breve opcional"
            value={message}
            onChangeText={onChangeMessage}
            maxLength={280}
            multiline
          />
          {selected?.canThank && (
            <TextInput
              style={styles.input}
              placeholder="Agradecimiento público opcional"
              value={thanks}
              onChangeText={onChangeThanks}
              maxLength={280}
              multiline
            />
          )}
          <Pressable style={styles.submit} onPress={onSubmit}>
            <Text style={styles.submitText}>Guardar valoración</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  segment: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: Colors.gray100,
    padding: 4,
    borderRadius: 8,
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
