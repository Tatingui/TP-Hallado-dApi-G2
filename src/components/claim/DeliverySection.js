import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import QrScannerModal from "./QrScannerModal";
import ShowQrModal from "./ShowQrModal";

/**
 * Cierre del reclamo aceptado con lectura de QR y alternativa manual.
 * - Quien devuelve el objeto (Devolver) muestra su código QR en pantalla.
 * - Quien lo recupera (Recuperador) escanea el código QR con la cámara (o galería/manual).
 */
export default function DeliverySection({
  claim,
  type,
  isDelivered,
  onConfirmDelivery,
  onCancelClaim,
  isProcessing,
  isOfflineMode,
}) {
  const [showQrModalVisible, setShowQrModalVisible] = useState(false);
  const [scannerModalVisible, setScannerModalVisible] = useState(false);

  if (isDelivered) {
    return (
      <View style={styles.deliveredBox}>
        <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
        <Text style={styles.deliveredText}>
          Entrega confirmada: el caso está en el historial
        </Text>
      </View>
    );
  }

  const disabled = isProcessing || isOfflineMode;

  const isReceived = type === "RECEIVED";
  const isFoundPub = claim.publicationType === "FOUND";

  // Quien devuelve: Publicador en FOUND, Reclamante en LOST.
  const isDevolver = (isReceived && isFoundPub) || (!isReceived && !isFoundPub);

  const handleConfirmQr = (claimId) => {
    setScannerModalVisible(false);
    onConfirmDelivery(claimId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        {isDevolver
          ? "Muestra tu código QR al momento de entregar el objeto:"
          : "Escanea el código QR para confirmar que recibiste el objeto:"}
      </Text>

      <View style={styles.actionsVertical}>
        {isDevolver ? (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.qrBtn,
              disabled && styles.disabled,
            ]}
            onPress={() => setShowQrModalVisible(true)}
            disabled={disabled}
          >
            <Ionicons name="qr-code-outline" size={18} color={Colors.surface} />
            <Text style={styles.qrBtnText}>Mostrar código QR</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.scanBtn,
              disabled && styles.disabled,
            ]}
            onPress={() => setScannerModalVisible(true)}
            disabled={disabled}
          >
            {isProcessing ? (
              <ActivityIndicator color={Colors.surface} size="small" />
            ) : (
              <>
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={Colors.surface}
                />
                <Text style={styles.scanBtnText}>Escanear QR de entrega</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.secondaryActions}>
          {isReceived && (
            <TouchableOpacity
              style={[styles.secondaryBtn, styles.cancelBtn]}
              onPress={() => onCancelClaim(claim.id)}
              disabled={disabled}
            >
              <Text style={styles.cancelBtnText}>Cancelar reclamo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              styles.manualBtn,
              disabled && styles.disabled,
            ]}
            onPress={() => onConfirmDelivery(claim.id)}
            disabled={disabled}
          >
            <Text style={styles.manualBtnText}>Confirmación sin QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modales QR */}
      <ShowQrModal
        visible={showQrModalVisible}
        onClose={() => setShowQrModalVisible(false)}
        claim={claim}
      />

      <QrScannerModal
        visible={scannerModalVisible}
        onClose={() => setScannerModalVisible(false)}
        onConfirmQr={handleConfirmQr}
        claim={claim}
        isProcessing={isProcessing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    paddingTop: 0,
  },
  hint: {
    fontSize: 13,
    color: Colors.gray600,
    marginBottom: 8,
    fontWeight: "500",
  },
  actionsVertical: {
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  qrBtn: {
    backgroundColor: Colors.primary,
  },
  qrBtnText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  scanBtn: {
    backgroundColor: Colors.primary,
  },
  scanBtnText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: Colors.errorLight,
  },
  cancelBtnText: {
    color: Colors.error,
    fontWeight: "600",
    fontSize: 12,
  },
  manualBtn: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  manualBtnText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  deliveredBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
  },
  deliveredText: {
    flex: 1,
    color: Colors.successDark,
    fontSize: 13,
    fontWeight: "600",
  },
});
