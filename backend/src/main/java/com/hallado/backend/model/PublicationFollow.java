package com.hallado.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "publication_follows",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "publication_id"})
)
public class PublicationFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publication_id", nullable = false)
    private Publication publication;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private LocalDateTime lastSeenAt;

    public PublicationFollow() {}

    public PublicationFollow(User user, Publication publication) {
        this.user = user;
        this.publication = publication;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public Long getId() { return id; }

    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public Publication getPublication() { return publication; }

    public User getUser() { return user; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setId(Long id) { this.id = id; }

    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }
    public void setPublication(Publication publication) { this.publication = publication; }

    public void setUser(User user) { this.user = user; }
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.lastSeenAt == null && this.publication != null && this.publication.getUpdatedAt() != null) {
            this.lastSeenAt = this.publication.getUpdatedAt();
        }
        if (this.lastSeenAt == null) {
            this.lastSeenAt = this.createdAt;
        }
    }
}
