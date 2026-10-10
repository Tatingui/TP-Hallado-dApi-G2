-- ---------------------------------------------------------------
-- Crea la base y el usuario que necesita el backend de Hallado.
-- Se ejecuta UNA sola vez por maquina, conectandose como root.
--
-- No crea tablas: de eso se encarga Hibernate al arrancar la app,
-- a partir de las clases @Entity (spring.jpa.hibernate.ddl-auto=update).
--
-- Es idempotente: se puede correr varias veces sin romper nada.
-- ---------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS hallado
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'hallado'@'localhost' IDENTIFIED BY 'hallado';

GRANT ALL PRIVILEGES ON hallado.* TO 'hallado'@'localhost';

FLUSH PRIVILEGES;

SELECT 'Base y usuario creados correctamente.' AS resultado;
