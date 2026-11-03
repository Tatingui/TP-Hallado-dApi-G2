package com.hallado.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Último paso del registro: con el código ya validado, se definen nombre y contraseña.
 */
public class CompleteRegistrationRequest {

    @NotBlank(message = "El email es obligatorio")
    private String email;

    @NotBlank(message = "El código es obligatorio")
    private String code;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = PasswordRules.MIN_LENGTH, message = PasswordRules.MIN_LENGTH_MESSAGE)
    @Pattern(regexp = PasswordRules.PATTERN, message = PasswordRules.PATTERN_MESSAGE)
    private String password;

    public CompleteRegistrationRequest() {
    }

    public CompleteRegistrationRequest(String email, String code, String nombre, String password) {
        this.email = email;
        this.code = code;
        this.nombre = nombre;
        this.password = password;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
