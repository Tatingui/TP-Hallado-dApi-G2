import { useEffect, useState } from "react";
import { Alert } from "react-native";
import useImagePicker from "./useImagePicker";
import { getMyProfile, updateMyProfile, uploadProfileImage } from "../services/userService";
import {
  hasBiometricHardware,
  isBiometricEnabled,
  setBiometricEnabled,
  getBiometricType,
} from "../services/biometricService";

/**
 * Hook que encapsula la lógica de edición del perfil: carga de datos,
 * campos del formulario, foto de perfil, bloqueo biométrico y guardado.
 * La navegación y el aviso de éxito quedan en la pantalla.
 */
export default function useEditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [barrio, setBarrio] = useState("");
  const { pickImage: pickImageFromGallery } = useImagePicker();
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
    const result = await pickImageFromGallery({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.status === "denied") {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería para elegir una foto.");
      return;
    }
    if (result.asset) {
      setSelectedImage(result.asset);
    }
  }

  function removeImage() {
    setSelectedImage(null);
    setProfileImageUrl("");
  }

  /**
   * Valida y guarda el perfil (subiendo primero la foto nueva si la hay).
   * Devuelve true si se guardó correctamente; los errores se avisan con Alert.
   */
  async function saveProfile() {
    if (!nombre.trim()) {
      Alert.alert("Campo Requerido", "El nombre no puede estar vacío.");
      return false;
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

      return true;
    } catch (err) {
      Alert.alert("Error", err?.message || "Ocurrió un problema al guardar los cambios.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
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
  };
}
