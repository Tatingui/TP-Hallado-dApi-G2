package com.hallado.backend.dto;

/**
 * Solicitud para actualizar datos del perfil de usuario (PUT /usuarios/me).
 */
public class UserProfileUpdateRequest {

    private String nombre;
    private String telefono;
    private Boolean telefonoVisible;
    private String barrio;
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
