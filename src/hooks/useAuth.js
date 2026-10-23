import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook para acceder al contexto de autenticacion.
 * Tira error si se usa fuera del AuthProvider.
 *
 * Uso: const { user, token, login, logout, loading } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return context;
}
