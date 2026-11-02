# Hallado — App de Objetos y Mascotas Perdidas (WatermelonDB + Expo Architecture)

Aplicación móvil desarrollada con **React Native + Expo (SDK 58)**, **WatermelonDB (SQLite local)** y un backend en **Spring Boot (Java 17 / MySQL)**.

---

## 🏛️ Arquitectura del Sistema

El proyecto sigue una arquitectura **Offline-First** estructurada en capas:

1. **Almacenamiento Local:**
   * **`WatermelonDB` (SQLite):** Publicaciones, fotos locales, borradores, cola de operaciones pendientes (`pending_operations`), búsquedas recientes y reclamos.
   * **`SecureStore`:** Almacenamiento cifrado de tokens JWT.
   * **`AsyncStorage`:** Indicadores de interfaz y preferencias simples.
2. **Coordinador de Sincronización (`src/sync/syncCoordinator.js`):**
   * Monitorea la conectividad de red con `@react-native-community/netinfo`.
   * Procesa las operaciones creadas en modo offline de forma idempotente enviando la cabecera `X-Idempotency-Key` al backend.
3. **Backend en Spring Boot:**
   * API REST con filtro de idempotencia (`IdempotencyFilter`) para prevenir duplicados ante reconexiones de red.

---

## 🚀 Requisitos Previos e Instalación

### 1. Dependencias
```bash
npm install --legacy-peer-deps
```

### 2. Base de datos MySQL y Backend
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

### 3. Ejecución en Expo (Development Build / Expo Go)
```bash
npx expo start -c
```

---

## 📊 Estado de Implementación de los 10 Puntos del TPO

* ✅ **Punto 1:** Autenticación, OTP, Login, Recupero de Contraseña y Bloqueo Biométrico.
* ✅ **Punto 2:** Perfil, Reputación, Insignias y Perfil Público.
* ✅ **Punto 3:** Buscador Inicial Guiado (Tipo Inverso, Categorías, Barrio/GPS, Búsquedas Recientes).
* ✅ **Punto 4:** Detalle de Publicación con acciones y dirección enmascarada.
* ✅ **Punto 5:** Publicar Hallazgo/Pérdida (Wizard, verificación, fotos locales y borradores).
* ✅ **Punto 6:** Modo Sin Conexión Completo (Caché local en WatermelonDB, cola de sincronización e idempotencia).
* ✅ **Punto 7:** Reclamos y Verificación (Pregunta de seguridad, 3 intentos máx, scheduler de expiración a 48hs y panel Mis Reclamos).
* ⏳ **Punto 8:** Devolución y Punto de Encuentro (Mapa / Google Maps).
* ⏳ **Punto 9:** Alertas y Seguidas.
* ⏳ **Punto 10:** Historial y Valoraciones.
