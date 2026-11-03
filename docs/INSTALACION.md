# Instalación y arranque de Hallado

La app es una **development build** de Expo: se compila una app Android propia que reemplaza a Expo Go. **Expo Go no sirve para este proyecto**, porque WatermelonDB necesita código nativo que no viene incluido en Expo Go.

Esta guía está pensada para Windows. Los pasos 1 a 4 se hacen **una sola vez por computadora**.

## Resumen

| Cuándo | Qué hacer |
|---|---|
| Primera vez | Pasos 1 a 4 y después `instalar.bat` |
| Cada vez que se cambian dependencias nativas | `instalar.bat` |
| Día a día | `iniciar.bat` |

## 1. Programas necesarios

| Programa | Versión | Para qué |
|---|---|---|
| Node.js | 22.13 o superior | Expo y Metro |
| JDK | 17 o superior | Backend Spring Boot y compilación Android |
| MySQL | 8 | Base de datos del backend |
| Android Studio | Última | SDK, emulador y herramientas de compilación |

Para verificar: `node -v` y `java -version`.

## 2. Android Studio

1. En **Device Manager**, crear un emulador (por ejemplo, *Medium Phone*).
2. En **Settings → Languages & Frameworks → Android SDK → SDK Tools**, tildar **CMake** y tocar **Apply**.
   - Hace falta la versión **3.31 o superior**: la que viene por defecto no admite rutas largas en Windows.
   - El NDK y las Build-Tools no hace falta instalarlos a mano: Gradle los descarga solo en la primera compilación.

No es necesario configurar `ANDROID_HOME`: el script de compilación detecta el SDK en la ruta por defecto (`%LOCALAPPDATA%\Android\Sdk`). Si el SDK está instalado en otra carpeta, hay que definir esa variable.

## 3. Habilitar rutas largas en Windows

React Native compila código C++ con rutas de más de 260 caracteres, que es el límite por defecto de Windows. Sin este paso, la build falla con `Filename longer than 260 characters`.

Abrir PowerShell **como administrador** y ejecutar:

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Después, **reiniciar la computadora**.

## 4. Base de datos

Conectado a MySQL como `root`, ejecutar una sola vez `backend/setup-db.sql`. Crea la base `hallado` y el usuario `hallado`/`hallado`. Las tablas las crea el backend al arrancar.

## 5. Instalar la app

Con el emulador abierto, hacer doble clic en **`instalar.bat`**, o ejecutarlo desde una terminal en la raíz del proyecto. El script:

1. Instala las dependencias con `npm ci`. Al terminar se aplica automáticamente un ajuste de compatibilidad de WatermelonDB (`scripts/postinstall.js`).
2. Ejecuta `npm run android`, que:
   - crea `.env.local` si no existe;
   - verifica el SDK, la CMake y las rutas largas;
   - genera `android/local.properties`;
   - compila la app, la instala en el emulador y la abre.

La primera compilación tarda entre 10 y 20 minutos. Las siguientes son mucho más rápidas.

## 6. Arranque diario

Doble clic en **`iniciar.bat`**. Abre dos ventanas:

| Ventana | Qué es | Puerto |
|---|---|---|
| Hallado - Backend | Spring Boot (`backend/start-backend.bat`) | 8081 |
| Hallado - Metro | Servidor de Expo, abre la app en el emulador | 8082 |

Metro usa el **8082** porque el backend ocupa el 8081, que es el puerto por defecto de Metro. Los cambios en el código JavaScript se ven al guardar; con `r` en la ventana de Metro se recarga la app.

Para frenar todo, cerrar las dos ventanas.

## Configuración

`.env.local` define la URL del backend (`EXPO_PUBLIC_API_URL`):

| Dispositivo | Valor |
|---|---|
| Emulador (por defecto) | `http://10.0.2.2:8081/api` |
| Celular físico en la misma red Wi-Fi | `http://<IPv4 de la PC>:8081/api` (sacarla con `ipconfig`) |

Después de cambiarla, reiniciar Metro.

## Problemas frecuentes

| Mensaje | Causa y solución |
|---|---|
| `Project is incompatible with this version of Expo Go` | Se abrió con Expo Go. Usar `iniciar.bat` y abrir la app **TPReactNative** del emulador. |
| `Port 8081 was already in use` | Quedó otro proceso en el puerto. `netstat -ano \| findstr :8081` y `taskkill /PID <número> /F`. |
| `SDK location not found` | El SDK no está en la ruta por defecto. Definir `ANDROID_HOME` y volver a correr `instalar.bat`. |
| `Filename longer than 260 characters` | Faltan el paso 3 (rutas largas y reinicio) o la CMake 3.31+ del paso 2. |
| `Device emulator-5554 is in state offline` | Cerrar el emulador y, en Device Manager, usar **Cold Boot Now**. Verificar con `adb devices`. |
| `No development build (com.hallado.app) ... is installed` | La app no llegó a instalarse. Correr `npm run android` con el emulador ya iniciado. |
| `cannot find symbol: variable BuildConfig` | No se aplicó el ajuste de WatermelonDB. Ejecutar `node scripts/postinstall.js` y recompilar. |

Para otras alternativas, como compilar en la nube con EAS, ver [DEVELOPMENT.md](DEVELOPMENT.md).
