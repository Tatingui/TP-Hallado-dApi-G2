import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../constants/theme";

export default function StepImages({ form, pickImages, removeImage }) {
  return (
    <View>
      <Text style={styles.stepTitle}>Fotos (opcional)</Text>
      <Text style={styles.stepSubtitle}>Agregá hasta 4 fotos</Text>
      <View style={styles.imageGrid}>
        {form.images.map((img, i) => (
          <View key={i} style={styles.imageContainer}>
            <Image source={{ uri: img.uri }} style={styles.imageThumb} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(i)}>
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        {form.images.length < 4 && (
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
            <Ionicons name="camera-outline" size={32} color={Colors.textSecondary} />
            <Text style={styles.addImageText}>Agregar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  imageContainer: { position: "relative" },
  imageThumb: { width: 100, height: 100, borderRadius: 10 },
  removeImageBtn: { position: "absolute", top: -8, right: -8 },
  addImageBtn: {
    width: 100, height: 100, borderRadius: 10, borderWidth: 2,
    borderColor: Colors.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center",
  },
  addImageText: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
});
