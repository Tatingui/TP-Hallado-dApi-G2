import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";

/**
 * Modal de escaneo de código QR para confirmar la entrega del objeto.
 * Validación estricta del formato de entrega Hallado y coincidencia exacta de claimId.
 */
export default function QrScannerModal({
  visible,
  onClose,
  onConfirmQr,
  claim,
  isProcessing,
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const scannedRef = useRef(false);
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [facing, setFacing] = useState("back");

  useEffect(() => {
    if (visible) {
      resetScan();
      setShowManualInput(false);
      setManualCode("");
    }
  }, [visible]);

  const resetScan = () => {
    scannedRef.current = false;
    setScanned(false);
  };

  if (!visible || !claim) return null;

  const handleBarCodeScanned = ({ data }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setScanned(true);
    processScannedData(data, false);
  };

  const processScannedData = (rawValue, isManual = false) => {
    try {
      if (!rawValue) {
        Alert.alert(
          "QR Inválido",
          "El código QR está vacío. Prueba con el código QR específico de esta entrega.",
          [{ text: "Prueba con otro QR", onPress: resetScan }],
        );
        return;
      }

      const strData = String(rawValue).trim();
      let scannedClaimId = null;
      let isValidFormat = false;

      // 1. Caso JSON estructurado {"claimId": 1, "type": "HALLADO_DELIVERY"}
      if (strData.startsWith("{")) {
        try {
          const parsed = JSON.parse(strData);
          if (
            parsed.type === "HALLADO_DELIVERY" &&
            (parsed.claimId || parsed.id)
          ) {
            scannedClaimId = parsed.claimId || parsed.id;
            isValidFormat = true;
          }
        } catch (e) {
          isValidFormat = false;
        }
      }
      // 2. Caso prefijo de etiqueta QR estructurada HALLADO_DELIVERY_1 o HALLADO-DELIVERY-1
      else if (
        /^HALLADO[-_]DELIVERY[-_]\d+$/i.test(strData) ||
        /^HALLADO[-_]\d+$/i.test(strData)
      ) {
        const match = strData.match(/\d+/);
        if (match) {
          scannedClaimId = parseInt(match[0], 10);
          isValidFormat = true;
        }
      }
      // 3. Caso ingreso manual explícito por teclado
      else if (isManual && /^#?\d+$/.test(strData)) {
        scannedClaimId = parseInt(strData.replace("#", ""), 10);
        isValidFormat = true;
      }

      // Si NO es un formato de entrega Hallado válido
      if (!isValidFormat || !scannedClaimId) {
        Alert.alert(
          "QR Inválido",
          "El código QR escaneado no es un código de entrega de Hallado válido. Prueba con otro QR.",
          [{ text: "Prueba con otro QR", onPress: resetScan }],
        );
        return;
      }

      // Si el formato es válido pero pertenece a OTRO reclamo
      if (String(scannedClaimId) !== String(claim.id)) {
        Alert.alert(
          "QR Inválido",
          `Este código QR pertenece al reclamo #${scannedClaimId}. Para esta entrega debes escanear el QR del reclamo #${claim.id}. Prueba con otro QR.`,
          [{ text: "Prueba con otro QR", onPress: resetScan }],
        );
        return;
      }

      // Confirmación ÚNICAMENTE cuando el QR es específico de este reclamo
      onConfirmQr(claim.id);
    } catch (e) {
      Alert.alert(
        "QR Inválido",
        "Ocurrió un error al procesar el código QR. Prueba con otro QR.",
        [{ text: "Prueba con otro QR", onPress: resetScan }],
      );
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setShowManualInput(true);
      Alert.alert(
        "Imagen de Galería Seleccionada",
        `Para confirmar el reclamo #${claim.id}, ingresá el número de código del QR de la imagen:`,
        [{ text: "Entendido" }],
      );
    } catch (err) {
      Alert.alert("Error", "No se pudo abrir la galería de fotos.");
    }
  };

  const handleManualSubmit = () => {
    const trimmed = manualCode.trim();
    if (!trimmed) {
      Alert.alert("Atención", "Ingresá el código o ID del reclamo.");
      return;
    }
    processScannedData(trimmed, true);
  };

  const openSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (err) {
      Alert.alert(
        "Error",
        "No se pudo abrir la configuración del dispositivo.",
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Escanear QR de Entrega</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              disabled={isProcessing}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {isProcessing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Confirmando entrega...</Text>
            </View>
          ) : !permission ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Verificando permisos...</Text>
            </View>
          ) : !permission.granted ? (
            /* Vista explicativa cuando no hay permisos de cámara */
            <View style={styles.permissionBox}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="camera-outline"
                  size={48}
                  color={Colors.error}
                />
              </View>
              <Text style={styles.permissionTitle}>
                Permiso de Cámara Requerido
              </Text>
              <Text style={styles.permissionText}>
                Necesitamos acceso a la cámara para poder escanear el código QR
                de entrega y confirmar la devolución del objeto.
              </Text>

              <View style={styles.permissionActions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={requestPermission}
                >
                  <Ionicons name="camera" size={18} color={Colors.surface} />
                  <Text style={styles.primaryBtnText}>Conceder Permiso</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={openSettings}
                >
                  <Ionicons
                    name="settings-outline"
                    size={18}
                    color={Colors.primary}
                  />
                  <Text style={styles.secondaryBtnText}>
                    Ir a Configuración
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={handlePickFromGallery}
                >
                  <Ionicons
                    name="images-outline"
                    size={18}
                    color={Colors.primary}
                  />
                  <Text style={styles.secondaryBtnText}>
                    Elegir foto de la galería
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.textBtn}
                  onPress={() => setShowManualInput(!showManualInput)}
                >
                  <Text style={styles.textBtnText}>
                    {showManualInput
                      ? "Ocultar ingreso manual"
                      : "Ingresar código de QR manualmente"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showManualInput && (
                <View style={styles.manualBox}>
                  <TextInput
                    style={styles.manualInput}
                    placeholder={`Ingresá #${claim.id}`}
                    placeholderTextColor={Colors.gray400}
                    value={manualCode}
                    onChangeText={setManualCode}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.manualBtn}
                    onPress={handleManualSubmit}
                  >
                    <Text style={styles.manualBtnText}>Validar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* Vista con Cámara activa */
            <View style={styles.cameraBox}>
              <CameraView
                style={{ flex: 1, width: "100%", height: "100%" }}
                facing={facing}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />

              <View style={styles.finderOverlay} pointerEvents="none">
                <View style={styles.finderFrame} />
                <Text style={styles.finderHint}>
                  Apuntá con la cámara al código QR de la otra persona o al QR
                  impreso
                </Text>
              </View>

              <View style={styles.bottomBar}>
                <TouchableOpacity
                  style={styles.galleryBarBtn}
                  onPress={() =>
                    setFacing((current) =>
                      current === "back" ? "front" : "back",
                    )
                  }
                >
                  <Ionicons
                    name="camera-reverse-outline"
                    size={18}
                    color={Colors.surface}
                  />
                  <Text style={styles.galleryBarBtnText}>
                    {facing === "front" ? "Trasera" : "Frontal"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryBarBtn}
                  onPress={handlePickFromGallery}
                >
                  <Ionicons name="images" size={18} color={Colors.surface} />
                  <Text style={styles.galleryBarBtnText}>Galería</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryBarBtn}
                  onPress={() => setShowManualInput(!showManualInput)}
                >
                  <Ionicons
                    name="keypad-outline"
                    size={18}
                    color={Colors.surface}
                  />
                  <Text style={styles.galleryBarBtnText}>Código</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryBarBtn}
                  onPress={openSettings}
                >
                  <Ionicons
                    name="settings-outline"
                    size={18}
                    color={Colors.surface}
                  />
                  <Text style={styles.galleryBarBtnText}>Ajustes</Text>
                </TouchableOpacity>
              </View>

              {showManualInput && (
                <View style={styles.manualOverlayBox}>
                  <TextInput
                    style={styles.manualInput}
                    placeholder={`Ingresá #${claim.id}`}
                    placeholderTextColor={Colors.gray400}
                    value={manualCode}
                    onChangeText={setManualCode}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.manualBtn}
                    onPress={handleManualSubmit}
                  >
                    <Text style={styles.manualBtnText}>Validar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    padding: 16,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 460,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  loadingBox: {
    flex: 1,
    justify: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 350,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  permissionBox: {
    padding: 24,
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  permissionActions: {
    width: "100%",
    gap: 8,
  },
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryBtn: {
    flexDirection: "row",
    backgroundColor: Colors.inputBackground,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  textBtn: {
    paddingVertical: 8,
    alignItems: "center",
  },
  textBtnText: {
    color: Colors.gray600,
    fontSize: 13,
  },
  manualBox: {
    flexDirection: "row",
    width: "100%",
    marginTop: 12,
    gap: 8,
  },
  manualInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: Colors.text,
  },
  manualBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  manualBtnText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  manualOverlayBox: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.85)",
    padding: 10,
    borderRadius: 12,
  },
  cameraBox: {
    height: 480,
    width: "100%",
    position: "relative",
    backgroundColor: "#000",
  },
  finderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    paddingBottom: 70,
  },
  finderFrame: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  finderHint: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bottomBar: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justify: "space-around",
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 14,
    paddingVertical: 10,
    zIndex: 10,
  },
  galleryBarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  galleryBarBtnText: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: "600",
  },
});
