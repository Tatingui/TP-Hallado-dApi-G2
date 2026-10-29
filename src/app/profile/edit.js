import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getMyProfile, updateMyProfile, uploadProfileImage } from "../../services/userService";
import { IMAGE_BASE_URL } from "../../services/api";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import {
  hasBiometricHardware,
  isBiometricEnabled,
  setBiometricEnabled,
  getBiometricType,
} from "../../services/biometricService";

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [barrio, setBarrio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [telefonoVisible, setTelefonoVisible] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometría");

  useEffect(() => {
    loadProfileData();
    loadBiometricState();
  }, []);

  async function loadProfileData() {
    try {
      setLoading(true);
      const data = await getMyProfile();
      if (data) {
        setNombre(data.nombre || "");
        setTelefono(data.telefono || "");
        setBarrio(data.barrio || "");
        setProfileImageUrl(data.profileImageUrl || "");
        setTelefonoVisible(data.telefonoVisible ?? true);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo cargar la información para editar.");
    } finally {
      setLoading(false);
    }
  }

  async function loadBiometricState() {
    try {
      const available = await hasBiometricHardware();
      setBiometricAvailable(available);
      if (available) {
        const enabled = await isBiometricEnabled();
        setBiometricEnabledState(enabled);
        const type = await getBiometricType();
        setBiometricLabel(type);
      }
    } catch {
      setBiometricAvailable(false);
    }
  }

  async function toggleBiometric(value) {
    setBiometricEnabledState(value);
    await setBiometricEnabled(value);
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería para elegir una foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        fileName: asset.fileName || `profile_${Date.now()}.jpg`,
      });
    }
  }

  async function handleSave() {
    if (!nombre.trim()) {
      Alert.alert("Campo Requerido", "El nombre no puede estar vacío.");
      return;
    }

    try {
      setSaving(true);

      // Si el usuario eligió una nueva foto, subirla primero
      if (selectedImage) {
        setUploadingImage(true);
        try {
          const updatedProfile = await uploadProfileImage(selectedImage);
          setProfileImageUrl(updatedProfile.profileImageUrl || "");
          setSelectedImage(null);
        } catch (imgErr) {
          Alert.alert("Error", "No se pudo subir la imagen. Se guardarán los demás cambios.");
        } finally {
          setUploadingImage(false);
        }
      }

      await updateMyProfile({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        barrio: barrio.trim(),
        telefonoVisible,
      });

      Alert.alert("Perfil Actualizado", "Tus datos se guardaron correctamente.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", err?.message || "Ocurrió un problema al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textOnPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Editar Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Nombre */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej. Juan Pérez"
            placeholderTextColor={Colors.disabled}
          />
        </View>

        {/* Teléfono */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Teléfono de contacto</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Ej. 11 1234-5678"
            keyboardType="phone-pad"
            placeholderTextColor={Colors.disabled}
          />
        </View>

        {/* Barrio */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Barrio / Localidad</Text>
          <TextInput
            style={styles.input}
            value={barrio}
            onChangeText={setBarrio}
            placeholder="Ej. Palermo, Belgrano, San Telmo..."
            placeholderTextColor={Colors.disabled}
          />
        </View>

        {/* Foto de perfil */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Foto de perfil (opcional)</Text>
          <View style={styles.imagePickerRow}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage.uri }} style={styles.profilePreview} />
            ) : profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl.startsWith("http") ? profileImageUrl : `${IMAGE_BASE_URL}${profileImageUrl}` }}
                style={styles.profilePreview}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person-outline" size={32} color={Colors.disabled} />
              </View>
            )}
            <View style={styles.imagePickerActions}>
              <Pressable style={styles.pickImageBtn} onPress={pickImage} disabled={uploadingImage}>
                <Ionicons name="image-outline" size={18} color={Colors.textOnPrimary} />
                <Text style={styles.pickImageBtnText}>
                  {profileImageUrl || selectedImage ? "Cambiar foto" : "Elegir foto"}
                </Text>
              </Pressable>
              {(profileImageUrl || selectedImage) && (
                <Pressable
                  style={styles.removeImageBtn}
                  onPress={() => {
                    setSelectedImage(null);
                    setProfileImageUrl("");
                  }}
                >
                  <Text style={styles.removeImageText}>Quitar</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Visibilidad de teléfono */}
        <View style={styles.switchGroup}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchLabel}>Mostrar teléfono en reclamos aceptados</Text>
            <Text style={styles.switchSublabel}>
              Si está desactivado, el otro participante se comunicará únicamente por la app.
            </Text>
          </View>
          <Switch
            value={telefonoVisible}
            onValueChange={setTelefonoVisible}
            trackColor={{ false: Colors.disabled, true: Colors.primaryLight }}
            thumbColor={telefonoVisible ? Colors.primary : Colors.surface}
          />
        </View>

        {/* Bloqueo biométrico */}
        {biometricAvailable && (
          <View style={styles.switchGroup}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Bloqueo con {biometricLabel}</Text>
              <Text style={styles.switchSublabel}>
                Al abrir la app se pedirá {biometricLabel} para acceder.
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: Colors.disabled, true: Colors.primaryLight }}
              thumbColor={biometricEnabled ? Colors.primary : Colors.surface}
            />
          </View>
        )}

        {/* Save Button */}
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <>
              <Ionicons name="checkmark-sharp" size={20} color={Colors.surface} />
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  topBar: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  backButton: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
    color: Colors.textOnPrimary,
  },
  formContainer: {
    padding: Spacing.lg,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
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
  switchGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  switchLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  switchSublabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    marginTop: Spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: FontSize.md,
    fontWeight: "bold",
  },
});
