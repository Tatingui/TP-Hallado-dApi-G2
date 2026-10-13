package com.hallado.backend.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Respuesta con el perfil privado del usuario autenticado (GET /usuarios/me).
 */
public class UserProfileResponse {

    private Long id;
    private String nombre;
    private String email;
    private String telefono;
    private boolean telefonoVisible = true;
    private String barrio;
    private String profileImageUrl;
    private String miembroDesde;

    private int devolucionesConcretadas;
    private int valoracionesPositivas;
    private int valoracionesNegativas;
    private double porcentajePositivo;
    private List<String> insignias = new ArrayList<>();

    public UserProfileResponse() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public boolean isTelefonoVisible() { return telefonoVisible; }
    public void setTelefonoVisible(boolean telefonoVisible) { this.telefonoVisible = telefonoVisible; }

    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public String getMiembroDesde() { return miembroDesde; }
    public void setMiembroDesde(String miembroDesde) { this.miembroDesde = miembroDesde; }

    public int getDevolucionesConcretadas() { return devolucionesConcretadas; }
    public void setDevolucionesConcretadas(int devolucionesConcretadas) { this.devolucionesConcretadas = devolucionesConcretadas; }

    public int getValoracionesPositivas() { return valoracionesPositivas; }
    public void setValoracionesPositivas(int valoracionesPositivas) { this.valoracionesPositivas = valoracionesPositivas; }

    public int getValoracionesNegativas() { return valoracionesNegativas; }
    public void setValoracionesNegativas(int valoracionesNegativas) { this.valoracionesNegativas = valoracionesNegativas; }

    public double getPorcentajePositivo() { return porcentajePositivo; }
    public void setPorcentajePositivo(double porcentajePositivo) { this.porcentajePositivo = porcentajePositivo; }

    public List<String> getInsignias() { return insignias; }
    public void setInsignias(List<String> insignias) { this.insignias = insignias != null ? insignias : new ArrayList<>(); }
}
