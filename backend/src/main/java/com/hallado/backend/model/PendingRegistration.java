package com.hallado.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * Registro en curso (Punto 1): email → código OTP → contraseña.
 * El usuario definitivo se crea recién al completar el último paso;
 * mientras tanto, el email y su código viven acá.
 */
@Entity
@Table(name = "pending_registrations")
public class PendingRegistration implements OtpHolder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String otpCode;

    private LocalDateTime otpExpiresAt;

    /** Intentos fallidos con el código actual; al llegar al máximo el código se invalida. */
    private Integer otpAttempts;

    /** true cuando el código fue validado y solo falta definir nombre y contraseña. */
    private boolean verified;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    public PendingRegistration() {
    }

    public PendingRegistration(String email) {
        this.email = email;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public String getEmail() { return email; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public LocalDateTime getOtpExpiresAt() { return otpExpiresAt; }
    public void setOtpExpiresAt(LocalDateTime otpExpiresAt) { this.otpExpiresAt = otpExpiresAt; }

    public int getOtpAttempts() { return otpAttempts == null ? 0 : otpAttempts; }
    public void setOtpAttempts(int otpAttempts) { this.otpAttempts = otpAttempts; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
