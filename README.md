# Hallado — base Expo y WatermelonDB

Aplicación Android con React Native, Expo development build y backend Spring Boot + MySQL.

## Desarrollo

- Instalar dependencias con `npm ci`.
- Preparar MySQL con `backend/setup-db.sql` y arrancar el backend desde `backend` con `./mvnw spring-boot:run` o `.\mvnw.cmd spring-boot:run` en Windows.
- Copiar `.env.example` a `.env.local` y definir la URL de la API para el emulador o teléfono.
- Instalar Android SDK/JDK y ejecutar `npm run android` para compilar e instalar la development build.
- Ejecutar `npm start` en las siguientes sesiones. Recompilar al agregar módulos nativos.

**Expo Go no soporta esta arquitectura.** Ver [guía de compilación local y EAS](docs/DEVELOPMENT.md).

## Etapas de integración

Esta rama aporta la base nativa, esquema versionado, modelos, almacenamiento separado por cuenta y repositorios. La integración de las pantallas, migración y fotos pertenece a la etapa 3/4; el coordinador y la idempotencia transaccional del servidor pertenecen a la etapa 5/6/7. Integrar las ramas en ese orden.

La presencia de modelos no certifica que los diez puntos del TPO estén completos. Antes de la entrega hay que ejecutar los recorridos funcionales y validar SQLite en Android.
