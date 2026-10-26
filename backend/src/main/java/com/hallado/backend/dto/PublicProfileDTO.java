package com.hallado.backend.dto;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

/**
 * DTO para el perfil público de un usuario (GET /usuarios/{id}/publico).
 * No incluye teléfono, email ni historial de publicaciones.
 */
public class PublicProfileDTO {

    private Long id;
    private String nombre;
    private String barrio;
    private String profileImageUrl;
    private String miembroDesde;

    private int devolucionesConcretadas;
    private int valoracionesPositivas;
    private int valoracionesNegativas;
    private double porcentajePositivo;
    private List<String> insignias = new ArrayList<>();
    private List<PublicThanksDTO> agradecimientos = new ArrayList<>();

    public static class PublicThanksDTO {
        private String authorName;
        private String message;
        private LocalDateTime createdAt;
        public PublicThanksDTO(String authorName, String message, LocalDateTime createdAt) {
            this.authorName = authorName; this.message = message; this.createdAt = createdAt;
        }
        public String getAuthorName() { return authorName; }
        public String getMessage() { return message; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    public PublicProfileDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

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
    public List<PublicThanksDTO> getAgradecimientos() { return agradecimientos; }
    public void setAgradecimientos(List<PublicThanksDTO> agradecimientos) { this.agradecimientos = agradecimientos; }
}
