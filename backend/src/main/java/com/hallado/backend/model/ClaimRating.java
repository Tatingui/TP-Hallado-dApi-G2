package com.hallado.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claim_ratings", uniqueConstraints = @UniqueConstraint(columnNames = {"claim_id", "author_id"}))
public class ClaimRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rated_user_id", nullable = false)
    private User ratedUser;

    @Column(nullable = false)
    private boolean positive;

    @Column(length = 280)
    private String message;

    @Column(length = 280)
    private String publicThanks;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Claim getClaim() { return claim; }
    public void setClaim(Claim claim) { this.claim = claim; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    public User getRatedUser() { return ratedUser; }
    public void setRatedUser(User ratedUser) { this.ratedUser = ratedUser; }
    public boolean isPositive() { return positive; }
    public void setPositive(boolean positive) { this.positive = positive; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPublicThanks() { return publicThanks; }
    public void setPublicThanks(String publicThanks) { this.publicThanks = publicThanks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
