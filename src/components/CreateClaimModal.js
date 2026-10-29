import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/theme';
import { PublicationType } from '../constants/publicationConstants';
import { checkNetworkConnection } from '../hooks/useNetworkStatus';

export default function CreateClaimModal({
  visible,
  onClose,
  onSubmit,
  publicationType,
  verificationQuestion,
  isSubmitting,
}) {
  const [proofMessage, setProofMessage] = useState('');
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const isFound = publicationType === PublicationType.FOUND;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tus fotos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para usar la cámara.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSelectImage = () => {
    Alert.alert(
      'Subir evidencia',
      '¿Cómo querés adjuntar la foto?',
      [
        { text: 'Tomar Foto', onPress: takePhoto },
        { text: 'Elegir de Galería', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleSubmit = async () => {
    const isOnline = await checkNetworkConnection();
    if (!isOnline) {
      Alert.alert('Sin conexión', 'Se requiere conexión a internet para enviar reclamos.');
      return;
    }

    // Validaciones estrictas Punto 7
    if (isFound && !verificationAnswer.trim()) {
      Alert.alert('Falta respuesta', 'Debés responder la pregunta de verificación obligatoria.');
      return;
    }

    if (!isFound && !imageUri) {
      Alert.alert('Evidencia requerida', 'Debés adjuntar una foto del objeto que encontraste.');
      return;
    }

    onSubmit({ proofMessage, verificationAnswer, imageUri });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isFound ? 'Reclamar "Es mío"' : 'Reportar "Lo encontré"'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.infoBannerText}>
                {isFound
                  ? 'Estás por reclamar este objeto. Solo tenés 3 intentos permitidos por publicación.'
                  : 'Gracias por tu solidaridad. El dueño será notificado con tu evidencia.'}
              </Text>
            </View>

            {isFound && verificationQuestion ? (
              <View style={styles.section}>
                <Text style={styles.label}>
                  Pregunta de seguridad (Obligatoria) <Text style={styles.asterisk}>*</Text>
                </Text>
                <Text style={styles.questionText}>"{verificationQuestion}"</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Escribí tu respuesta exacta"
                  value={verificationAnswer}
                  onChangeText={setVerificationAnswer}
                  autoCapitalize="none"
                />
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.label}>
                Mensaje o Descripción {isFound ? '(Opcional)' : '(Barrio/Detalles)'}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={
                  isFound
                    ? 'Agregá algún detalle para que el dueño se asegure que es tuyo...'
                    : 'Ej: Lo encontré cerca del kiosco en Av. Corrientes al 3000...'
                }
                value={proofMessage}
                onChangeText={setProofMessage}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                Evidencia fotográfica {!isFound && <Text style={styles.asterisk}>*</Text>}
              </Text>
              <Text style={styles.hint}>
                {isFound
                  ? 'Podés subir un ticket de compra o foto tuya con el objeto.'
                  : 'Tomá una foto clara del objeto que hallaste.'}
              </Text>

              {imageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImageUri(null)}
                  >
                    <Ionicons name="trash" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={handleSelectImage}>
                  <MaterialCommunityIcons name="camera-plus" size={32} color={Colors.primary} />
                  <Text style={styles.uploadBtnText}>Adjuntar foto</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Enviar Reclamo</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface || '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text || '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
    alignItems: 'center',
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text || '#111827',
    marginBottom: 8,
  },
  asterisk: {
    color: '#EF4444',
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary || '#6B7280',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: Colors.primary || '#6D28D9',
    marginBottom: 10,
    backgroundColor: '#F3E8FF',
    padding: 10,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border || '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
    color: Colors.text || '#111827',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadBtn: {
    borderWidth: 2,
    borderColor: Colors.border || '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadBtnText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.primary || '#6D28D9',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    height: 180,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border || '#E5E7EB',
    backgroundColor: Colors.surface || '#FFF',
  },
  submitBtn: {
    backgroundColor: Colors.primary || '#6D28D9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
