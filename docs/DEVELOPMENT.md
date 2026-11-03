# Desarrollo Android con Expo

La aplicación usa módulos nativos de WatermelonDB y se ejecuta en una development build propia. Expo Go no es un entorno compatible para esta aplicación.

La instalación local paso a paso está en [INSTALACION.md](INSTALACION.md). En resumen:

1. `npm ci` instala las dependencias y aplica `scripts/postinstall.js` (compatibilidad de WatermelonDB con Android Gradle Plugin 9).
2. `npm run android` ejecuta `scripts/prepare-android.js` (crea `.env.local`, ubica el SDK y la CMake, genera `android/local.properties`) y después compila e instala la build con `expo run:android --port 8082`.
3. Para cambios JavaScript posteriores alcanza con `npm start` (Metro en el puerto 8082). Recompilar al cambiar dependencias nativas.

Alternativa en la nube: vincular el proyecto a la cuenta EAS del equipo y ejecutar `eas build --platform android --profile development`. Instalar el artefacto y ejecutar `npm start`.

No ejecutar `prebuild --clean` sobre modificaciones nativas manuales sin preservarlas. Los directorios nativos son generados y no se versionan.

## Verificación requerida en Android

- Abrir la development build y comprobar que inicializa WatermelonDB.
- Crear datos locales, cerrar completamente la app y comprobar su persistencia.
- Repetir en una instalación limpia y con datos de la versión anterior.

La instalación JavaScript y las pruebas unitarias no sustituyen esta validación nativa. Los perfiles EAS requieren la cuenta y credenciales del equipo; no se incluyen credenciales en el repositorio.
