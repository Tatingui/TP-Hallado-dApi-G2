# Desarrollo Android con Expo

La aplicación usa módulos nativos de WatermelonDB y se ejecuta en una development build propia. Expo Go no es un entorno compatible para esta aplicación.

1. Instalar Node compatible con el SDK Expo del proyecto y ejecutar `npm ci`.
2. Copiar `.env.example` a `.env.local` y configurar la URL del backend. En un dispositivo físico usar la IP LAN de la PC.
3. Instalar Android Studio, SDK y JDK compatibles con la versión de React Native. Configurar `ANDROID_HOME` y un emulador o dispositivo con depuración USB.
4. Ejecutar `npm run android`. Expo genera el proyecto Android e instala una build que incluye los módulos nativos mediante autolinking.
5. Para cambios JavaScript posteriores ejecutar `npm start`. Recompilar al cambiar dependencias nativas.

Alternativa en la nube: vincular el proyecto a la cuenta EAS del equipo y ejecutar `eas build --platform android --profile development`. Instalar el artefacto y ejecutar `npm start`.

No ejecutar `prebuild --clean` sobre modificaciones nativas manuales sin preservarlas. Los directorios nativos son generados y no se versionan.

## Verificación requerida en Android

- Abrir la development build y comprobar que inicializa WatermelonDB.
- Crear datos locales, cerrar completamente la app y comprobar su persistencia.
- Repetir en una instalación limpia y con datos de la versión anterior.

La instalación JavaScript y las pruebas unitarias no sustituyen esta validación nativa. Los perfiles EAS requieren la cuenta y credenciales del equipo; no se incluyen credenciales en el repositorio.
