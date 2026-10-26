package com.hallado.backend.dto;

import com.hallado.backend.model.Claim;
import com.hallado.backend.model.ClaimStatus;
import com.hallado.backend.model.MeetingPointStatus;
import com.hallado.backend.model.PublicationType;

import java.time.LocalDateTime;

public class ClaimResponseDTO {

    private Long id;
    private ClaimStatus status;
    private String proofMessage;
    private String proofImageUrl;
    private LocalDateTime claimDate;

    // Minimal info of the publication
    private Long publicationId;
    private String publicationTitle;
    private String publicationType;
    private String publicationImageUrl;
    private String publicationBarrio;

    // Contact info (ONLY visible if status is ACCEPTED)
    private ClaimantSummaryDTO claimant;
    private PublisherSummaryDTO publisher;
    private String exactAddress; // Only visible if ACCEPTED

    // Punto 8: Punto de encuentro
    private String meetingAddress;
    private MeetingPointStatus meetingStatus;
    private boolean meetingProposedByMe;
    private boolean canProposeMeeting; // Quien tiene el objeto, mientras no haya propuesta
    private boolean canRespondMeeting; // La otra parte, mientras la propuesta esté pendiente

    public static class ClaimantSummaryDTO {
        private Long id;
        private String name;
        private String profileImageUrl;
        private String phone; // Null unless ACCEPTED

        public ClaimantSummaryDTO(Long id, String name, String profileImageUrl, String phone) {
            this.id = id;
            this.name = name;
            this.profileImageUrl = profileImageUrl;
            this.phone = phone;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getProfileImageUrl() { return profileImageUrl; }
        public String getPhone() { return phone; }
    }

    public static class PublisherSummaryDTO {
        private Long id;
        private String name;
        private String phone; // Null unless ACCEPTED and publisher wants it visible

        public PublisherSummaryDTO(Long id, String name, String phone) {
            this.id = id;
            this.name = name;
            this.phone = phone;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getPhone() { return phone; }
    }

    public static ClaimResponseDTO fromEntity(Claim claim, boolean isPublisher) {
        ClaimResponseDTO dto = new ClaimResponseDTO();
        dto.setId(claim.getId());
        dto.setStatus(claim.getStatus());
        dto.setProofMessage(claim.getProofMessage());
        dto.setProofImageUrl(claim.getProofImageUrl());
        dto.setClaimDate(claim.getClaimDate());

        dto.setPublicationId(claim.getPublication().getId());
        dto.setPublicationTitle(claim.getPublication().getTitle());
        dto.setPublicationType(claim.getPublication().getType().name());
        dto.setPublicationBarrio(claim.getPublication().getBarrio());

        String[] pubImages = claim.getPublication().getImageUrls() != null ? claim.getPublication().getImageUrls().split(",") : new String[0];
        if (pubImages.length > 0) {
            dto.setPublicationImageUrl(pubImages[0]);
        }

        boolean isAccepted = claim.getStatus() == ClaimStatus.ACCEPTED;

        // Populate Claimant
        String claimantPhone = (isAccepted && isPublisher) ? claim.getClaimant().getTelefono() : null;
        if (!isPublisher && isAccepted) {
            claimantPhone = claim.getClaimant().getTelefono();
        }
        
        dto.setClaimant(new ClaimantSummaryDTO(
                claim.getClaimant().getId(),
                claim.getClaimant().getNombre(),
                claim.getClaimant().getProfileImageUrl(),
                claimantPhone
        ));

        // Populate Publisher
        String publisherPhone = null;
        if (isAccepted && claim.getPublication().getUser().isTelefonoVisible()) {
            publisherPhone = claim.getPublication().getUser().getTelefono();
        }
        dto.setPublisher(new PublisherSummaryDTO(
                claim.getPublication().getUser().getId(),
                claim.getPublication().getUser().getNombre(),
                publisherPhone
        ));

        // Punto 4 & 7: Direccion exacta se muestra SOLO cuando es aceptado.
        if (isAccepted) {
            dto.setExactAddress(claim.getPublication().getAddress());
        }

        // Punto 8: Si se encontró algo, el objeto lo tiene el publicador; si se perdió, quien reclamó
        boolean publisherHasObject = claim.getPublication().getType() == PublicationType.FOUND;
        boolean iHaveObject = isPublisher == publisherHasObject;
        Long myId = isPublisher ? claim.getPublication().getUser().getId() : claim.getClaimant().getId();
        boolean proposedByMe = claim.getMeetingProposedBy() != null && claim.getMeetingProposedBy().getId().equals(myId);

        dto.setMeetingAddress(claim.getMeetingAddress());
        dto.setMeetingStatus(claim.getMeetingStatus());
        dto.setMeetingProposedByMe(proposedByMe);
        dto.setCanProposeMeeting(isAccepted && claim.getMeetingStatus() == null && iHaveObject);
        dto.setCanRespondMeeting(isAccepted && claim.getMeetingStatus() == MeetingPointStatus.PROPOSED && !proposedByMe);

        return dto;
    }

    // Getters and Setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ClaimStatus getStatus() { return status; }
    public void setStatus(ClaimStatus status) { this.status = status; }
    public String getProofMessage() { return proofMessage; }
    public void setProofMessage(String proofMessage) { this.proofMessage = proofMessage; }
    public String getProofImageUrl() { return proofImageUrl; }
    public void setProofImageUrl(String proofImageUrl) { this.proofImageUrl = proofImageUrl; }
    public LocalDateTime getClaimDate() { return claimDate; }
    public void setClaimDate(LocalDateTime claimDate) { this.claimDate = claimDate; }
    public Long getPublicationId() { return publicationId; }
    public void setPublicationId(Long publicationId) { this.publicationId = publicationId; }
    public String getPublicationTitle() { return publicationTitle; }
    public void setPublicationTitle(String publicationTitle) { this.publicationTitle = publicationTitle; }
    public String getPublicationType() { return publicationType; }
    public void setPublicationType(String publicationType) { this.publicationType = publicationType; }
    public String getPublicationImageUrl() { return publicationImageUrl; }
    public void setPublicationImageUrl(String publicationImageUrl) { this.publicationImageUrl = publicationImageUrl; }
    public String getPublicationBarrio() { return publicationBarrio; }
    public void setPublicationBarrio(String publicationBarrio) { this.publicationBarrio = publicationBarrio; }
    public ClaimantSummaryDTO getClaimant() { return claimant; }
    public void setClaimant(ClaimantSummaryDTO claimant) { this.claimant = claimant; }
    public PublisherSummaryDTO getPublisher() { return publisher; }
    public void setPublisher(PublisherSummaryDTO publisher) { this.publisher = publisher; }
    public String getExactAddress() { return exactAddress; }
    public void setExactAddress(String exactAddress) { this.exactAddress = exactAddress; }
    public String getMeetingAddress() { return meetingAddress; }
    public void setMeetingAddress(String meetingAddress) { this.meetingAddress = meetingAddress; }
    public MeetingPointStatus getMeetingStatus() { return meetingStatus; }
    public void setMeetingStatus(MeetingPointStatus meetingStatus) { this.meetingStatus = meetingStatus; }
    public boolean isMeetingProposedByMe() { return meetingProposedByMe; }
    public void setMeetingProposedByMe(boolean meetingProposedByMe) { this.meetingProposedByMe = meetingProposedByMe; }
    public boolean isCanProposeMeeting() { return canProposeMeeting; }
    public void setCanProposeMeeting(boolean canProposeMeeting) { this.canProposeMeeting = canProposeMeeting; }
    public boolean isCanRespondMeeting() { return canRespondMeeting; }
    public void setCanRespondMeeting(boolean canRespondMeeting) { this.canRespondMeeting = canRespondMeeting; }
}
