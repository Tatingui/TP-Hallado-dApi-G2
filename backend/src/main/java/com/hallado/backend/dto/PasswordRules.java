package com.hallado.backend.dto;

/**
 * Reglas de contraseña compartidas por los DTOs que definen una contraseña
 * (registro y recupero). Son constantes para poder usarlas en las anotaciones
 * de validación; deben coincidir con los criterios de PasswordCriteria en la app.
 */
public final class PasswordRules {

    public static final int MIN_LENGTH = 6;
    public static final String MIN_LENGTH_MESSAGE = "La contraseña debe tener al menos 6 caracteres";

    public static final String PATTERN = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$";
    public static final String PATTERN_MESSAGE =
            "La contraseña debe contener al menos una mayúscula, un número y un carácter especial";

    private PasswordRules() {
    }
}
