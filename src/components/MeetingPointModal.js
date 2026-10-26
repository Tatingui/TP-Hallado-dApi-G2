import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

/**
 * Punto 8: Modal para proponer un punto de encuentro o sugerir uno alternativo.
 * Props:
 *   visible, onClose, onSubmit(address), isSubmitting
 *   currentAddress: propuesta de la otra parte (si se está sugiriendo una alternativa)
 */
export default function MeetingPointModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  currentAddress,
}) {
  const [address, setAddress] = useState('');

  const isAlternative = !!currentAddress;

  // Limpiar el campo cada vez que se abre
  useEffect(() => {
    if (visible) setAddress('');
  }, [visible]);

  const handleSubmit = () => {
    if (!address.trim()) {
      Alert.alert('Falta la dirección', 'Indicá dónde querés encontrarte con la otra persona.');
      return;
    }
    onSubmit(address.trim());
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
              {isAlternative ? 'Sugerir otro punto' : 'Proponer punto de encuentro'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {isAlternative && (
              <View style={styles.currentBox}>
                <Text style={styles.currentLabel}>Propuesta actual:</Text>
                <Text style={styles.currentValue}>{currentAddress}</Text>
              </View>
            )}

            <Text style={styles.label}>
              Dirección del punto de encuentro <Text style={styles.asterisk}>*</Text>
            </Text>
            <Text style={styles.hint}>
              Elegí un lugar público y escribí calle y altura (o una esquina) y el barrio,
              para que "Cómo llegar" lo encuentre bien en el mapa.
            </Text>
            <Text style={styles.hint}>
              Ej: "Av. Rivadavia 6500, Flores" o "Av. Corrientes y Callao, Balvanera"
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Calle y altura, barrio"
              value={address}
              onChangeText={setAddress}
              maxLength={255}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isAlternative ? 'Enviar alternativa' : 'Enviar propuesta'}
                </Text>
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
  currentBox: {
    backgroundColor: '#F3E8FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  currentValue: {
    fontSize: 14,
    color: Colors.primary || '#6D28D9',
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
  input: {
    borderWidth: 1,
    borderColor: Colors.border || '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
    color: Colors.text || '#111827',
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
