package com.hallado.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "publications")
public class Publication {

    /** Punto 5: las publicaciones vencen a los 30 días y pueden renovarse. */
    public static final int VIGENCIA_DIAS = 30;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PublicationType type; // LOST or FOUND

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoryEnum category;

    @Column(nullable = false)
    private String barrio;

    private String address;

    private Double latitude;

    private Double longitude;

    private LocalDateTime eventDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PublicationStatus status = PublicationStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String imageUrls; // Comma-separated or JSON string of image URLs

    private String verificationQuestion; // Private question for FOUND items

    private String verificationAnswer; // Private answer for FOUND items

    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Punto 9: última vez que cambió el estado (abierta, en reclamo, resuelta, vencida)
    private LocalDateTime statusChangedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Publication() {}

    public Publication(String title, String description, PublicationType type, CategoryEnum category, 
                       String barrio, String address, Double latitude, Double longitude, 
                       LocalDateTime eventDate, String imageUrls, User user) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.category = category;
        this.barrio = barrio;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.eventDate = eventDate;
        this.imageUrls = imageUrls;
        this.user = user;
    }

    public String getAddress() { return address; }

    public String getBarrio() { return barrio; }

    public CategoryEnum getCategory() { return category; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public String getDescription() { return description; }
    public LocalDateTime getEventDate() { return eventDate; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    // Getters and Setters
    public Long getId() { return id; }

    public String getImageUrls() { return imageUrls; }
    public Double getLatitude() { return latitude; }

    public Double getLongitude() { return longitude; }
    public PublicationStatus getStatus() { return status; }

    public String getTitle() { return title; }
    public PublicationType getType() { return type; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getStatusChangedAt() { return statusChangedAt; }
    public User getUser() { return user; }

    public String getVerificationAnswer() { return verificationAnswer; }
    public String getVerificationQuestion() { return verificationQuestion; }

    public void setAddress(String address) { this.address = address; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public void setCategory(CategoryEnum category) { this.category = category; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setDescription(String description) { this.description = description; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public void setId(Long id) { this.id = id; }

    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setStatus(PublicationStatus status) {
        // Punto 9: registrar cuándo cambia el estado, para la novedad de las publicaciones seguidas
        if (this.status != status) {
            this.statusChangedAt = LocalDateTime.now();
        }
        this.status = status;
    }

    public void setTitle(String title) { this.title = title; }
    public void setType(PublicationType type) { this.type = type; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setUser(User user) { this.user = user; }

    public void setVerificationAnswer(String verificationAnswer) { this.verificationAnswer = verificationAnswer; }
    public void setVerificationQuestion(String verificationQuestion) { this.verificationQuestion = verificationQuestion; }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.expiresAt == null) {
            this.expiresAt = this.createdAt.plusDays(VIGENCIA_DIAS);
        }
    }

    /** Abierta con la fecha de vencimiento ya cumplida (todavía no marcada como vencida). */
    public boolean isOverdue(LocalDateTime now) {
        return status == PublicationStatus.OPEN && expiresAt != null && !expiresAt.isAfter(now);
    }

    /** Se puede renovar si está vencida, o si su vigencia terminó y todavía no se marcó. */
    public boolean isRenewable(LocalDateTime now) {
        return status == PublicationStatus.EXPIRED || isOverdue(now);
    }

    /** Marca la publicación como vencida. */
    public void expire() {
        setStatus(PublicationStatus.EXPIRED);
    }

    /** Vuelve a abrir la publicación por otros 30 días a partir de ahora. */
    public void renew(LocalDateTime now) {
        this.expiresAt = now.plusDays(VIGENCIA_DIAS);
        setStatus(PublicationStatus.OPEN);
    }
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
