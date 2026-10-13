package com.hallado.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private boolean emailVerified;

    private String otpCode;

    private LocalDateTime otpExpiresAt;

    private String telefono;

    private boolean telefonoVisible = true;

    private String zona;

    private String barrio;

    private String profileImageUrl;

    private int devolucionesConcretadas = 0;

    private int valoracionesPositivas = 0;

    private int valoracionesNegativas = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    public User() {
    }

    public User(String nombre, String email, String password) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public LocalDateTime getOtpExpiresAt() { return otpExpiresAt; }
    public void setOtpExpiresAt(LocalDateTime otpExpiresAt) { this.otpExpiresAt = otpExpiresAt; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public boolean isTelefonoVisible() { return telefonoVisible; }
    public void setTelefonoVisible(boolean telefonoVisible) { this.telefonoVisible = telefonoVisible; }

    public String getZona() { return zona; }
    public void setZona(String zona) { this.zona = zona; }

    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public int getDevolucionesConcretadas() { return devolucionesConcretadas; }
    public void setDevolucionesConcretadas(int devolucionesConcretadas) { this.devolucionesConcretadas = devolucionesConcretadas; }

    public int getValoracionesPositivas() { return valoracionesPositivas; }
    public void setValoracionesPositivas(int valoracionesPositivas) { this.valoracionesPositivas = valoracionesPositivas; }

    public int getValoracionesNegativas() { return valoracionesNegativas; }
    public void setValoracionesNegativas(int valoracionesNegativas) { this.valoracionesNegativas = valoracionesNegativas; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id != null && id.equals(user.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
