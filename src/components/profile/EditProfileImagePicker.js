import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resolveImageUrl } from "../../utils/imageUrl";
import { Colors, FontSize, Spacing } from "../../constants/theme";

/**
 * Selector de foto de perfil: muestra la vista previa (foto nueva, actual o
 * placeholder) y los botones para elegir o quitar la imagen.
 */
export default function EditProfileImagePicker({
  selectedImage,
  profileImageUrl,
  uploadingImage,
  onPickImage,
  onRemoveImage,
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Foto de perfil (opcional)</Text>
      <View style={styles.imagePickerRow}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage.uri }} style={styles.profilePreview} />
        ) : profileImageUrl ? (
          <Image
            source={{ uri: resolveImageUrl(profileImageUrl) }}
            style={styles.profilePreview}
          />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Ionicons name="person-outline" size={32} color={Colors.disabled} />
          </View>
        )}
        <View style={styles.imagePickerActions}>
          <Pressable style={styles.pickImageBtn} onPress={onPickImage} disabled={uploadingImage}>
            <Ionicons name="image-outline" size={18} color={Colors.textOnPrimary} />
            <Text style={styles.pickImageBtnText}>
              {profileImageUrl || selectedImage ? "Cambiar foto" : "Elegir foto"}
            </Text>
          </Pressable>
          {(profileImageUrl || selectedImage) && (
            <Pressable style={styles.removeImageBtn} onPress={onRemoveImage}>
              <Text style={styles.removeImageText}>Quitar</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  imagePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  profilePreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.border,
  },
  profilePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePickerActions: {
    flex: 1,
    gap: Spacing.xs,
  },
  pickImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  pickImageBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  removeImageBtn: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  removeImageText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
});
