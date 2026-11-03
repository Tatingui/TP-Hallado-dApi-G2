# Verificación de la refactorización

## Comprobaciones automatizadas

- Pruebas JavaScript de aislamiento por cuenta, actualización de snapshots, cola transaccional, recuperación repetida de datos antiguos, archivos faltantes, exclusión mutua del sincronizador, reintentos y cambio de sesión durante un envío.
- Pruebas existentes de navegación y seguidas.
- Pruebas Spring Boot / H2 (8 clases, `mvnw test`): registro y recupero, fecha del suceso, vencimiento y renovación de publicaciones, vencimiento de reclamos, seguimiento, manejo global de errores, alta con y sin fotos e idempotencia (replay, payload incompatible, fallo seguido de reintento, solicitudes concurrentes y separación por usuario).
- Transformación Babel de las fuentes y generación del bundle Android con Hermes.

Estas pruebas no implican que se haya ejecutado una build nativa. Deben completarse las siguientes verificaciones en un Android real o emulador antes de aprobar la entrega.

## Recorrido Android requerido

1. Compilar con `npm run android` o EAS development. Verificar la apertura de SQLite y reinicio sin pérdida de registros.
2. Crear borrador con fotos, salir de la app y retomarlo en el paso guardado.
3. Abrir publicaciones y luego activar modo avión. Ver detalle, fotos descargadas y últimos resultados con aviso.
4. Crear una publicación offline. Reiniciar y comprobar que sigue pendiente.
5. Reconectar: comprobar una sola publicación remota y desaparición de la cola.
6. Cortar la conexión después de que el servidor acepte un envío. Reintentar y comprobar el mismo ID remoto.
7. Cambiar de cuenta con pendientes; verificar que la nueva cuenta no los ve ni los envía.
8. Probar datos de AsyncStorage anteriores: rechazar recuperación, aceptarla con la cuenta correcta y repetir tras una interrupción.
9. Probar una foto antigua inexistente: conservar pendiente bloqueado, abrir Corregir y seleccionar otra imagen.
10. Comprobar que reclamar, responder reclamos y seguir requieren conexión.
11. Revisar login, OTP, biometría, enlaces profundos y los diez puntos del TPO.

## Límites explícitos

- No se ejecutaron pruebas de dispositivo en el entorno de corrección porque no tiene Android SDK instalado.
- Los tests del servidor usan H2; antes de desplegar se debe verificar también contra la versión MySQL del equipo.
- Las copias locales contienen únicamente respuestas recibidas por la cuenta activa; los controles de privacidad de la API deben validarse como parte del TPO.
- Las fotos no descargadas se indican como faltantes. No se garantiza acceso offline a contenido que nunca se descargó.
- Los datos de la antigua cola se conservan como respaldo; la recuperación no elimina las claves anteriores.
- La generación del bundle verifica JavaScript/Hermes, no el enlace y funcionamiento de módulos nativos.
