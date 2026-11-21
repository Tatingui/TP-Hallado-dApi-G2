import { StyleSheet } from "react-native";
import { Colors, FontSize, Spacing } from "./theme";

/**
 * Estilos compartidos reutilizables en toda la app.
 * Usar con spread: style={[sharedStyles.card, styles.miEstiloExtra]}
 */
export const sharedStyles = StyleSheet.create({
  // --- Cards ---
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
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

  // --- Banner superior de pestañas principales (Inicio, Mis Publicaciones, Perfil) ---
  tabHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: 20,
    minHeight: 100,
  },

  tabHeaderTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textOnPrimary,
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
});
