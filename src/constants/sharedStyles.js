import { StyleSheet } from "react-native";
import { Colors, Spacing, FontSize } from "./theme";

/**
 * Estilos compartidos reutilizables en toda la app.
 * Usar con spread: style={[shared.card, styles.miEstiloExtra]}
 */
export const shared = StyleSheet.create({
  // --- Cards ---
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },

  cardElevated: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: "hidden",
  },

  // --- Status badges ---
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    color: Colors.surface,
    fontSize: 11,
    fontWeight: "700",
  },

  // --- Top bar (pantallas internas con flecha atrás) ---
  topBar: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  topBarTitle: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
    color: Colors.textOnPrimary,
  },

  backButton: {
    padding: 4,
  },

  // --- Contenedores comunes ---
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // --- Meta info (icono + texto en fila) ---
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  // --- Botones de acción ---
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  actionBtnPrimary: {
    backgroundColor: Colors.primary,
  },

  actionBtnDanger: {
    backgroundColor: Colors.errorLight,
  },

  actionBtnText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
});
