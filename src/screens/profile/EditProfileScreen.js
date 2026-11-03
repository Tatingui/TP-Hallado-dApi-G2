import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import { shared } from "../../constants/sharedStyles";
import useEditProfile from "../../hooks/useEditProfile";
import EditProfileField from "../../components/profile/EditProfileField";
import EditProfileImagePicker from "../../components/profile/EditProfileImagePicker";
import EditProfileSwitch from "../../components/profile/EditProfileSwitch";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const {
    loading,
    saving,
    nombre,
    setNombre,
    telefono,
    setTelefono,
    barrio,
    setBarrio,
    profileImageUrl,
    selectedImage,
    uploadingImage,
    telefonoVisible,
    setTelefonoVisible,
    biometricAvailable,
    biometricEnabled,
    biometricLabel,
    toggleBiometric,
    pickImage,
    removeImage,
    saveProfile,
  } = useEditProfile();

  async function handleSave() {
    const saved = await saveProfile();
    if (saved) {
      Alert.alert("Perfil Actualizado", "Tus datos se guardaron correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  }

  if (loading) {
    return (
      <View style={shared.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={shared.screenContainer}>
      {/* Top Bar */}
      <View style={shared.topBar}>
        <Pressable style={shared.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textOnPrimary} />
        </Pressable>
        <Text style={shared.topBarTitle}>Editar Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Nombre */}
        <EditProfileField
          label="Nombre completo *"
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Juan Pérez"
        />

        {/* Teléfono */}
        <EditProfileField
          label="Teléfono de contacto"
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Ej. 11 1234-5678"
          keyboardType="phone-pad"
        />

        {/* Barrio */}
        <EditProfileField
          label="Barrio / Localidad"
          value={barrio}
          onChangeText={setBarrio}
          placeholder="Ej. Palermo, Belgrano, San Telmo..."
        />

        {/* Foto de perfil */}
        <EditProfileImagePicker
          selectedImage={selectedImage}
          profileImageUrl={profileImageUrl}
          uploadingImage={uploadingImage}
          onPickImage={pickImage}
          onRemoveImage={removeImage}
        />

        {/* Visibilidad de teléfono */}
        <EditProfileSwitch
          label="Mostrar teléfono en reclamos aceptados"
          sublabel="Si está desactivado, el otro participante se comunicará únicamente por la app."
          value={telefonoVisible}
          onValueChange={setTelefonoVisible}
        />

        {/* Bloqueo biométrico */}
        {biometricAvailable && (
          <EditProfileSwitch
            label={`Bloqueo con ${biometricLabel}`}
            sublabel={`Al abrir la app se pedirá ${biometricLabel} para acceder.`}
            value={biometricEnabled}
            onValueChange={toggleBiometric}
          />
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
  formContainer: {
    padding: Spacing.lg,
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
