package com.hallado.backend.model;

import java.time.LocalDateTime;

/**
 * Entidad que guarda un código OTP pendiente (usuario o registro en curso).
 * Permite validar el código y contar los intentos fallidos en un único lugar.
 */
public interface OtpHolder {
    String getOtpCode();
    void setOtpCode(String otpCode);
    LocalDateTime getOtpExpiresAt();
    int getOtpAttempts();
    void setOtpAttempts(int otpAttempts);
}
