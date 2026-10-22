package com.hallado.backend.dto;

import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationStatus;
import com.hallado.backend.model.PublicationType;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class PublicationResponseDTO {

    private Long id;
    private String title;
    private String description;
    private PublicationType type;
    private CategoryEnum category;
    private String barrio;
    private Double latitude;
    private Double longitude;
    private LocalDateTime eventDate;
    private PublicationStatus status;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Double distanceKm; // Calculated when userLat & userLng are passed

    // Publisher summary
    private PublisherSummaryDTO publisher;

    public static class PublisherSummaryDTO {
        private Long id;
        private String nombre;
        private String profileImageUrl;
        private int devolucionesConcretadas;
        private int valoracionesPositivas;
        private int valoracionesNegativas;

        public PublisherSummaryDTO(Long id, String nombre, String profileImageUrl, 
                                   int devolucionesConcretadas, int valoracionesPositivas, int valoracionesNegativas) {
            this.id = id;
            this.nombre = nombre;
            this.profileImageUrl = profileImageUrl;
            this.devolucionesConcretadas = devolucionesConcretadas;
            this.valoracionesPositivas = valoracionesPositivas;
            this.valoracionesNegativas = valoracionesNegativas;
        }

        public Long getId() { return id; }
        public String getNombre() { return nombre; }
        public String getProfileImageUrl() { return profileImageUrl; }
        public int getDevolucionesConcretadas() { return devolucionesConcretadas; }
        public int getValoracionesPositivas() { return valoracionesPositivas; }
        public int getValoracionesNegativas() { return valoracionesNegativas; }
    }

    public PublicationResponseDTO() {}

    public static PublicationResponseDTO fromEntity(Publication p) {
        PublicationResponseDTO dto = new PublicationResponseDTO();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setType(p.getType());
        dto.setCategory(p.getCategory());
        dto.setBarrio(p.getBarrio());
        dto.setLatitude(p.getLatitude());
        dto.setLongitude(p.getLongitude());
        dto.setEventDate(p.getEventDate());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setExpiresAt(p.getExpiresAt());

        if (p.getImageUrls() != null && !p.getImageUrls().trim().isEmpty()) {
            dto.setImageUrls(Arrays.asList(p.getImageUrls().split(",")));
        } else {
            dto.setImageUrls(Collections.emptyList());
        }

        if (p.getUser() != null) {
            dto.setPublisher(new PublisherSummaryDTO(
                p.getUser().getId(),
                p.getUser().getNombre(),
                p.getUser().getProfileImageUrl(),
                p.getUser().getDevolucionesConcretadas(),
                p.getUser().getValoracionesPositivas(),
                p.getUser().getValoracionesNegativas()
            ));
        }

        return dto;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public PublicationType getType() { return type; }
    public void setType(PublicationType type) { this.type = type; }

    public CategoryEnum getCategory() { return category; }
    public void setCategory(CategoryEnum category) { this.category = category; }

    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public PublicationStatus getStatus() { return status; }
    public void setStatus(PublicationStatus status) { this.status = status; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public PublisherSummaryDTO getPublisher() { return publisher; }
    public void setPublisher(PublisherSummaryDTO publisher) { this.publisher = publisher; }
}
