package com.hallado.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "El email es obligatorio")
    private String email;

    @NotBlank(message = "El código es obligatorio")
    private String code;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = PasswordRules.MIN_LENGTH, message = PasswordRules.MIN_LENGTH_MESSAGE)
    @Pattern(regexp = PasswordRules.PATTERN, message = PasswordRules.PATTERN_MESSAGE)
    private String newPassword;

    public ResetPasswordRequest() {}
    public ResetPasswordRequest(String email, String code, String newPassword) {
        this.email = email;
        this.code = code;
        this.newPassword = newPassword;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
