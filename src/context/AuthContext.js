import { setDatabaseSession, subscribeSession, getDatabaseSession, markDatabaseReady } from '../database/session';
import { migrateAsyncStorageToWatermelon } from '../database/dataMigration';
import { createContext, useState, useEffect } from "react";
import { resetTo } from "../navigation/navigationRef";
import {
  saveSession,
  getToken,
  getUserEmail,
  clearSession,
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
    return subscribeSession(() => {
      try { getDatabaseSession(); } catch { setToken(null); setUser(null); }
    });
  }, []);

  async function restoreSession() {
    try {
      const storedToken = await getToken();
      if (storedToken) {
        const email = await getUserEmail();
        setDatabaseSession(email, storedToken);
        await migrateAsyncStorageToWatermelon();
        markDatabaseReady();
        setToken(storedToken);
        setUser(email);
      }
    } catch (error) {
      setDatabaseSession(null, null);
      console.error("No se pudo restaurar la sesión y sus datos:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Guarda token y email en storage seguro y actualiza el estado.
   */
  async function loginContext(newToken, email) {
    await saveSession(newToken, email);
    setDatabaseSession(email, newToken);
    await migrateAsyncStorageToWatermelon();
        markDatabaseReady();
    setToken(newToken);
    setUser(email);
  }

  /**
   * Limpia storage y estado — cierra sesion.
   */
  async function logout(loginParams) {
    setDatabaseSession(null, null);
    await clearSession();
    setToken(null);
    setUser(null);
    resetTo("Login", loginParams);
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
