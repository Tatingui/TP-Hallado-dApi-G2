# Hallado — React Native, Expo y WatermelonDB

Aplicación Android con Expo development build, WatermelonDB (SQLite local) y API Spring Boot + MySQL. **No se ejecuta en Expo Go.**

## Instalación y arranque

La guía completa, con requisitos y solución de problemas, está en **[docs/INSTALACION.md](docs/INSTALACION.md)**.

| Cuándo | Comando |
|---|---|
| Primera vez (después de los requisitos de la guía) y cuando cambian dependencias nativas | `instalar.bat` |
| Día a día: backend + Metro + app en el emulador | `iniciar.bat` |

El backend usa el puerto 8081 con el prefijo `/api`, y Metro el 8082. En el emulador Android la app usa `http://10.0.2.2:8081/api`; en un teléfono físico, la IP LAN de la computadora (`.env.local`).

Ver [guía de development builds](docs/DEVELOPMENT.md) para compilación local o EAS. El proyecto EAS se vincula con la cuenta del equipo; no se incluyen credenciales.

## Persistencia y sesión

- SecureStore conserva el token. AsyncStorage queda para preferencias y como respaldo de datos anteriores.
- WatermelonDB mantiene datos locales y snapshots de respuestas autorizadas, separados por cuenta.
- Borradores y resultados recientes se guardan en SQLite; las fotos se copian o descargan al directorio persistente de cada cuenta.
- Los datos antiguos sin propietario se recuperan solo tras una confirmación explícita dentro de la app. La copia original no se borra.
- La migración es reanudable; imágenes antiguas inexistentes quedan señaladas para corregirlas.

## Publicación y sincronización

El formulario guarda la publicación y su operación pendiente en un único batch de WatermelonDB. Un solo coordinador envía las publicaciones con la sesión de su propietario, al reconectar, volver al primer plano y durante el uso activo.

Los reintentos conservan la misma clave `X-Idempotency-Key`. Spring Boot registra respuesta y publicación en la misma transacción, con bloqueo de base de datos por usuario. Un fallo revierte el registro; un reintento exitoso devuelve el mismo resultado. Las fotos guardadas durante una transacción fallida se eliminan.

No se descartan pendientes por cantidad de intentos. Los errores temporales se reintentan con espera progresiva; los errores de validación quedan visibles y permiten recuperar el contenido para corregirlo desde Mis publicaciones. Los reclamos y sus respuestas no se encolan offline.

Al cambiar de sesión se invalidan las tareas anteriores. Si el servidor confirmó una publicación pero la sesión cambió antes de recibirla, la operación permanece pendiente y se reconcilia con su misma clave cuando vuelve su propietario.

## Pruebas

```sh
npm test
cd backend
./mvnw test
```

En Windows usar `.\mvnw.cmd test`. Los tests de dominio de WatermelonDB usan el adaptador Loki en Node: comprueban las operaciones, no sustituyen una ejecución con SQLite nativo.

Para generar el bundle Android:

```sh
npx expo export --platform android --output-dir dist
```

## Alcance y validación pendiente

Esta corrección integra persistencia y sincronización con los flujos existentes. **No certifica automáticamente los diez puntos del TPO.** La aceptación funcional completa requiere recorrerlos en Android.

Ver [verificación de la refactorización](docs/VERIFICATION.md). La ejecución en segundo plano con la aplicación cerrada, sincronización bidireccional general y resolución de ediciones concurrentes no se implementan aquí: las modificaciones remotas diferentes de crear publicaciones requieren conexión.

Orden de integración de las ramas: base (PR 39), datos offline (PR 40), sincronización y backend (PR 41). Son ramas acumulativas; no hacer squash de una etapa si se quiere conservar su relación de ancestros con las siguientes.
