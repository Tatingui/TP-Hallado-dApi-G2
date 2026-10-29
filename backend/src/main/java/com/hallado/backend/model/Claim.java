package com.hallado.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publication_id", nullable = false)
    private Publication publication;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claimant_id", nullable = false)
    private User claimant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status = ClaimStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String proofMessage;

    private String proofImageUrl;

    @Column(columnDefinition = "TEXT")
    private String verificationAnswer;

    @Column(nullable = false)
    private LocalDateTime claimDate;

    private LocalDateTime resolvedAt;

    // Punto 8: Punto de encuentro acordado una vez aceptado el reclamo
    private String meetingAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_proposed_by_id")
    private User meetingProposedBy;

    @Enumerated(EnumType.STRING)
    private MeetingPointStatus meetingStatus;

    public Claim() {
    }

    public Claim(Publication publication, User claimant, String proofMessage, String proofImageUrl) {
        this.publication = publication;
        this.claimant = claimant;
        this.proofMessage = proofMessage;
        this.proofImageUrl = proofImageUrl;
        this.claimDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Publication getPublication() { return publication; }
    public void setPublication(Publication publication) { this.publication = publication; }

    public User getClaimant() { return claimant; }
    public void setClaimant(User claimant) { this.claimant = claimant; }

    public ClaimStatus getStatus() { return status; }
    public void setStatus(ClaimStatus status) { this.status = status; }

    public String getProofMessage() { return proofMessage; }
    public void setProofMessage(String proofMessage) { this.proofMessage = proofMessage; }

    public String getProofImageUrl() { return proofImageUrl; }
    public void setProofImageUrl(String proofImageUrl) { this.proofImageUrl = proofImageUrl; }

    public LocalDateTime getClaimDate() { return claimDate; }
    public void setClaimDate(LocalDateTime claimDate) { this.claimDate = claimDate; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getMeetingAddress() { return meetingAddress; }
    public void setMeetingAddress(String meetingAddress) { this.meetingAddress = meetingAddress; }

    public User getMeetingProposedBy() { return meetingProposedBy; }
    public void setMeetingProposedBy(User meetingProposedBy) { this.meetingProposedBy = meetingProposedBy; }

    public MeetingPointStatus getMeetingStatus() { return meetingStatus; }
    public void setMeetingStatus(MeetingPointStatus meetingStatus) { this.meetingStatus = meetingStatus; }

    public String getVerificationAnswer() { return verificationAnswer; }
    public void setVerificationAnswer(String verificationAnswer) { this.verificationAnswer = verificationAnswer; }

}