package com.hallado.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Hibernate crea en MySQL la columna claims.status como ENUM con los estados que
 * existían en ese momento, y ddl-auto=update no la modifica al agregar uno nuevo
 * (CANCELLED). Al arrancar, si la columna sigue siendo ENUM, se pasa a VARCHAR.
 * En otras bases (H2 en los tests) la consulta no encuentra la columna y no hace nada.
 */
@Component
public class ClaimStatusColumnMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ClaimStatusColumnMigration.class);

    private final JdbcTemplate jdbc;

    public ClaimStatusColumnMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        String dataType;
        try {
            dataType = jdbc.queryForObject(
                    "SELECT DATA_TYPE FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'claims' AND COLUMN_NAME = 'status'",
                    String.class);
        } catch (DataAccessException e) {
            return;
        }
        if ("enum".equalsIgnoreCase(dataType)) {
            jdbc.execute("ALTER TABLE claims MODIFY COLUMN status VARCHAR(20) NOT NULL");
            log.info("Columna claims.status convertida de ENUM a VARCHAR(20).");
        }
    }
}
