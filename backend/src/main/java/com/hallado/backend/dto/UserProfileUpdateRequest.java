package com.hallado.backend.dto;

import jakarta.validation.constraints.Size;

/**
 * Solicitud para actualizar datos del perfil de usuario (PUT /usuarios/me).
 */
public class UserProfileUpdateRequest {

    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;
    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    private String telefono;
    private Boolean telefonoVisible;
    @Size(max = 100, message = "El barrio no puede superar los 100 caracteres")
    private String barrio;
    @Size(max = 500, message = "La URL de imagen no puede superar los 500 caracteres")
    private String profileImageUrl;

    public UserProfileUpdateRequest() {
    }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public Boolean getTelefonoVisible() { return telefonoVisible; }
    public void setTelefonoVisible(Boolean telefonoVisible) { this.telefonoVisible = telefonoVisible; }

    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
}
