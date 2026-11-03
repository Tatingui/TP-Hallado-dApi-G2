import { useState } from 'react';
import { Alert } from 'react-native';
import { checkNetworkConnection } from './useNetworkStatus';
import { createAlertApi, getAlertSummary } from '../services/alertService';

/**
 * Punto 9: hook para guardar una búsqueda como alerta.
 * Valida que haya al menos un criterio, chequea la conexión y muestra los Alerts
 * de éxito o error. Devuelve el estado de guardado y la acción saveAlert(criteria).
 */
export default function useSaveSearchAlert() {
  const [savingAlert, setSavingAlert] = useState(false);

  const saveAlert = async (criteria) => {
    if (savingAlert) return;

    if (!criteria.category && !criteria.barrio && !criteria.query) {
      Alert.alert(
        'Faltan criterios',
        'Elegí al menos una categoría, un barrio o palabras clave para guardar la alerta.'
      );
      return;
    }

    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      Alert.alert('Sin conexión', 'Necesitás conexión a internet para guardar una alerta.');
      return;
    }

    try {
      setSavingAlert(true);
      await createAlertApi(criteria);
      // Mismo resumen que se muestra en "Mis alertas": tipo • categoría • barrio • "palabras".
      const summary = getAlertSummary(criteria);
      Alert.alert(
        'Alerta guardada',
        `${summary}\n\nTe avisaremos cuando aparezcan publicaciones nuevas que coincidan.`
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo guardar la alerta.');
    } finally {
      setSavingAlert(false);
    }
  };

  return { savingAlert, saveAlert };
}
