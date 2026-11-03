import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing } from "../../constants/theme";

/**
 * Pie de la tarjeta del perfil público: antigüedad del usuario y aviso
 * de privacidad sobre los datos de contacto.
 */
export default function PublicProfileFooter({ miembroDesde }) {
  return (
    <>
      <View style={styles.antiguedadRow}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color={Colors.textSecondary}
        />
        <Text style={styles.antiguedadText}>
          Antigüedad: {miembroDesde || "Reciente"}
        </Text>
      </View>

      {/* Privacidad notice */}
      <View style={styles.privacyNotice}>
        <Ionicons
          name="shield-checkmark-outline"
          size={16}
          color={Colors.primary}
        />
        <Text style={styles.privacyNoticeText}>
          Por privacidad y seguridad de la comunidad, el teléfono y el
          correo de contacto no se muestran públicamente.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  antiguedadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  antiguedadText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  privacyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.sm,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privacyNoticeText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
