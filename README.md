# Hallado — App de objetos y mascotas perdidas

Aplicación móvil desarrollada con **React Native + Expo (JavaScript)** y un backend en **Spring Boot (Java 17)**. Proyecto universitario — Grupo 2.

---

## Requisitos previos

Antes de clonar el repositorio, asegurate de tener instalado:

| Herramienta | Versión mínima | Para qué se usa |
|---|---|---|
| **Node.js** | 18+ | Ejecutar Expo y el frontend |
| **npm** | 9+ | Instalar dependencias JS |
| **Java JDK** | 17 | Compilar y ejecutar el backend |
| **MySQL** | 8.0+ | Base de datos del backend |
| **Android Studio** | — | Emulador de Android |
| **Expo Go** | Última versión | Ejecutar la app en el emulador |

> **Nota:** No hace falta instalar Maven. El proyecto incluye `mvnw` (Maven Wrapper) que se descarga solo.

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/Tatingui/TP-Hallado-dApi-G2.git
cd TP-Hallado-dApi-G2
```

---

## 2. Configurar la base de datos (una sola vez)

Abrí MySQL como root y ejecutá el script incluido:

```bash
mysql -u root -p < backend/setup-db.sql
```

Esto crea la base `hallado` y el usuario `hallado`/`hallado`. Las tablas se crean solas cuando arranca el backend (Hibernate `ddl-auto=update`).

---

## 3. Levantar el backend

### Opción A — Con el script (recomendada para Windows)

```bash
cd backend
start-backend.bat
```

El `.bat` se encarga de:
- Agregar la regla de firewall para el puerto 8081 (solo la primera vez)
- Detectar el emulador y configurar `adb reverse tcp:8081 tcp:8081`
- Setear las credenciales de email para el OTP
- Levantar el servidor Spring Boot

### Opción B — Manual (cualquier sistema operativo)

```bash
cd backend

# Windows
.\mvnw.cmd spring-boot:run -Dmaven.test.skip=true

# Linux / macOS
./mvnw spring-boot:run -Dmaven.test.skip=true
```

> Si usás la opción manual, tenés que configurar `adb reverse` vos mismo (ver sección 5).

El backend corre en `http://localhost:8081/api`.

---

## 4. Instalar dependencias del frontend e iniciar Expo

Volvé a la raíz del proyecto y ejecutá:

```bash
npm install
npx expo start
```

Esto abre el menú de Expo en la terminal. Desde ahí:
- Presioná **`a`** para abrir en el emulador de Android
- O escaneá el QR con **Expo Go** en un celular físico

---

## 5. Configurar adb reverse (emulador Android)

Para que la app en el emulador se conecte al backend en tu máquina, necesitás este comando **cada vez que reiniciás el emulador**:

```bash
adb reverse tcp:8081 tcp:8081
```

> Si usás `start-backend.bat`, esto se hace automáticamente. Solo necesitás hacerlo manual si levantás el backend por tu cuenta.

La app usa `10.0.2.2:8081` como IP del host (es la IP especial que el emulador de Android asigna a la máquina host).

---

## 6. Verificar que todo funciona

1. El backend está corriendo si ves `Started HalladoBackendApplication` en la consola
2. La app se abre en el emulador mostrando la pantalla de login de Hallado
3. Podés registrar un usuario nuevo — te va a llegar un código OTP al email que pongas

---

## Estructura del proyecto

```
TP-Hallado-dApi-G2/
├── src/                          # Frontend React Native
│   ├── app/
│   │   ├── (auth)/               # Pantallas de autenticación
│   │   │   ├── login.js
│   │   │   ├── register.js
│   │   │   ├── verify-otp.js
│   │   │   ├── forgot-password.js
│   │   │   ├── reset-password.js
│   │   │   └── lock.js           # Bloqueo biométrico
│   │   └── (tabs)/
│   │       └── home.js           # Pantalla principal
│   ├── components/               # Componentes reutilizables
│   │   ├── LogoHallado.js
│   │   ├── PasswordInput.js      # Campo de contraseña con ojito
│   │   └── PasswordCriteria.js   # Indicador de criterios de seguridad
│   ├── services/                 # Comunicación con el backend
│   │   ├── api.js                # Cliente HTTP base
│   │   └── authService.js        # Endpoints de autenticación
│   ├── storage/
│   │   └── authStorage.js        # Persistencia con AsyncStorage
│   └── constants/
│       └── theme.js              # Colores, espaciado, fuentes
├── backend/                      # Backend Spring Boot
│   ├── src/main/java/com/hallado/backend/
│   │   ├── controller/           # Endpoints REST
│   │   ├── service/              # Lógica de negocio
│   │   ├── model/                # Entidades JPA
│   │   ├── dto/                  # Objetos de transferencia
│   │   ├── repository/           # Acceso a datos
│   │   └── config/               # JWT, seguridad, CORS
│   ├── setup-db.sql              # Script de creación de base de datos
│   └── start-backend.bat         # Script de arranque para Windows
└── README.md
```

---

## Problemas comunes

| Problema | Solución |
|---|---|
| `Connection refused` en la app | Verificá que el backend esté corriendo y que hiciste `adb reverse tcp:8081 tcp:8081` |
| No llega el email OTP | Revisá la consola del backend — el código OTP se imprime en el log de debug |
| El emulador no aparece en `adb devices` | Abrí el emulador desde Android Studio antes de correr el `.bat` |
| Error `JAVA_HOME not set` | Instalá JDK 17 y configurá la variable de entorno `JAVA_HOME` |
| `npm install` falla | Probá borrar `node_modules` y `package-lock.json`, y correr `npm install` de nuevo |
