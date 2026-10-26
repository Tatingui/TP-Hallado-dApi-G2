package com.hallado.backend.dto;

import java.time.LocalDateTime;

import com.hallado.backend.model.Claim;
import com.hallado.backend.model.ClaimRating;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.model.User;

public class ResolvedCaseDTO {
    public static ResolvedCaseDTO from(Claim claim, User current, ClaimRating rating) {
        ResolvedCaseDTO dto = new ResolvedCaseDTO();
        boolean publisher = claim.getPublication().getUser().getId().equals(current.getId());
        boolean devolver = claim.getPublication().getType() == PublicationType.FOUND ? publisher : !publisher;
        User counterpart = publisher ? claim.getClaimant() : claim.getPublication().getUser();
        dto.claimId = claim.getId();
        dto.publicationId = claim.getPublication().getId();
        dto.publicationTitle = claim.getPublication().getTitle();
        dto.publicationType = claim.getPublication().getType().name();
        dto.resolvedAt = claim.getResolvedAt();
        dto.role = devolver ? "DEVOLVI" : "RECUPERE";
        dto.counterpartId = counterpart.getId();
        dto.counterpartName = counterpart.getNombre();
        dto.canRate = rating == null && claim.getResolvedAt() != null && claim.getResolvedAt().plusDays(7).isAfter(LocalDateTime.now());
        dto.rated = rating != null;
        dto.canThank = !devolver && dto.canRate;
        dto.ratingMessage = rating != null ? rating.getMessage() : null;
        return dto;
    }
    private Long claimId;
    private Long publicationId;
    private String publicationTitle;
    private String publicationType;
    private LocalDateTime resolvedAt;
    private String role;
    private String counterpartName;
    private Long counterpartId;
    private boolean canRate;
    private boolean rated;
    private boolean canThank;

    private String ratingMessage;
    public Long getClaimId() { return claimId; }
    public Long getCounterpartId() { return counterpartId; }
    public String getCounterpartName() { return counterpartName; }
    public Long getPublicationId() { return publicationId; }
    public String getPublicationTitle() { return publicationTitle; }
    public String getPublicationType() { return publicationType; }
    public String getRatingMessage() { return ratingMessage; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public String getRole() { return role; }
    public boolean isCanRate() { return canRate; }
    public boolean isCanThank() { return canThank; }
    public boolean isRated() { return rated; }
}
