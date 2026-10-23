import { createContext, useState, useEffect } from "react";
import {
  saveSession,
  getToken,
  getUserEmail,
  clearSession,
  isLoggedIn,
} from "../storage/authStorage";

export const AuthContext = createContext(null);

/**
 * AuthProvider — provee estado de autenticacion a toda la app.
 *
 * Expone: user (email), token, isAuthenticated, loading,
 *         login(token, email), logout()
 *
 * Patron visto en clase: Context + Provider + custom hook (useAuth).
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // email del usuario
  const [loading, setLoading] = useState(true);

  // Al montar, chequear si hay sesion guardada
  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const storedToken = await getToken();
      if (storedToken) {
        const email = await getUserEmail();
        setToken(storedToken);
        setUser(email);
      }
    } catch (error) {
      console.error("Error restaurando sesion:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Guarda token y email en storage seguro y actualiza el estado.
   */
  async function loginContext(newToken, email) {
    await saveSession(newToken, email);
    setToken(newToken);
    setUser(email);
  }

  /**
   * Limpia storage y estado — cierra sesion.
   */
  async function logout() {
    await clearSession();
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    isAuthenticated: token !== null,
    loading,
    login: loginContext,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
