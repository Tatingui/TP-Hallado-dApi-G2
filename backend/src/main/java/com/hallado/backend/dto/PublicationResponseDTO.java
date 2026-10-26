package com.hallado.backend.dto;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationStatus;
import com.hallado.backend.model.PublicationType;

public class PublicationResponseDTO {

    public static class PublisherSummaryDTO {
        private Long id;
        private String nombre;
        private String email; // <- Agregado para validar isMyPublication en frontend
        private String profileImageUrl;
        private int devolucionesConcretadas;
        private int valoracionesPositivas;
        private int valoracionesNegativas;

        public PublisherSummaryDTO(Long id, String nombre, String email, String profileImageUrl, 
                                   int devolucionesConcretadas, int valoracionesPositivas, int valoracionesNegativas) {
            this.id = id;
            this.nombre = nombre;
            this.email = email;
            this.profileImageUrl = profileImageUrl;
            this.devolucionesConcretadas = devolucionesConcretadas;
            this.valoracionesPositivas = valoracionesPositivas;
            this.valoracionesNegativas = valoracionesNegativas;
        }

        public int getDevolucionesConcretadas() { return devolucionesConcretadas; }
        public String getEmail() { return email; }
        public Long getId() { return id; }
        public String getNombre() { return nombre; }
        public String getProfileImageUrl() { return profileImageUrl; }
        public int getValoracionesNegativas() { return valoracionesNegativas; }
        public int getValoracionesPositivas() { return valoracionesPositivas; }
    }
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
        dto.setUpdatedAt(p.getUpdatedAt());
        dto.setExpiresAt(p.getExpiresAt());
        dto.setVerificationQuestion(p.getVerificationQuestion());

        if (p.getImageUrls() != null && !p.getImageUrls().trim().isEmpty()) {
            dto.setImageUrls(Arrays.asList(p.getImageUrls().split(",")));
        } else {
            dto.setImageUrls(Collections.emptyList());
        }

        if (p.getUser() != null) {
            dto.setPublisher(new PublisherSummaryDTO(
                p.getUser().getId(),
                p.getUser().getNombre(),
                p.getUser().getEmail(),
                p.getUser().getProfileImageUrl(),
                p.getUser().getDevolucionesConcretadas(),
                p.getUser().getValoracionesPositivas(),
                p.getUser().getValoracionesNegativas()
            ));
        }

        return dto;
    }
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
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;
    private String verificationQuestion;

    private Double distanceKm; // Calculated when userLat & userLng are passed

    private boolean hasNewUpdates;

    // Publisher summary
    private PublisherSummaryDTO publisher;

    public PublicationResponseDTO() {}

    public String getBarrio() { return barrio; }
    public CategoryEnum getCategory() { return category; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getDescription() { return description; }

    public Double getDistanceKm() { return distanceKm; }
    public LocalDateTime getEventDate() { return eventDate; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public String getVerificationQuestion() { return verificationQuestion; }
    // Getters & Setters
    public Long getId() { return id; }

    public List<String> getImageUrls() { return imageUrls; }
    public Double getLatitude() { return latitude; }

    public Double getLongitude() { return longitude; }
    public PublisherSummaryDTO getPublisher() { return publisher; }

    public PublicationStatus getStatus() { return status; }
    public String getTitle() { return title; }

    public PublicationType getType() { return type; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public boolean isHasNewUpdates() { return hasNewUpdates; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public void setCategory(CategoryEnum category) { this.category = category; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setDescription(String description) { this.description = description; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public void setVerificationQuestion(String verificationQuestion) { this.verificationQuestion = verificationQuestion; }

    public void setHasNewUpdates(boolean hasNewUpdates) { this.hasNewUpdates = hasNewUpdates; }
    public void setId(Long id) { this.id = id; }

    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setPublisher(PublisherSummaryDTO publisher) { this.publisher = publisher; }

    public void setStatus(PublicationStatus status) { this.status = status; }
    public void setTitle(String title) { this.title = title; }

    public void setType(PublicationType type) { this.type = type; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
