package com.hallado.backend.dto;

import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationType;
import java.time.LocalDateTime;

public class PublicationEditResponseDTO {
    private Long id;
    private String title;
    private String description;
    private PublicationType type;
    private String verificationQuestion;
    private String verificationAnswer;
    private String barrio;
    private String address;
    private Double latitude;
    private Double longitude;
    private LocalDateTime eventDate;

    public static PublicationEditResponseDTO fromEntity(Publication publication) {
        PublicationEditResponseDTO dto = new PublicationEditResponseDTO();
        dto.id = publication.getId();
        dto.title = publication.getTitle();
        dto.description = publication.getDescription();
        dto.type = publication.getType();
        dto.verificationQuestion = publication.getVerificationQuestion();
        dto.verificationAnswer = publication.getVerificationAnswer();
        dto.barrio = publication.getBarrio();
        dto.address = publication.getAddress();
        dto.latitude = publication.getLatitude();
        dto.longitude = publication.getLongitude();
        dto.eventDate = publication.getEventDate();
        return dto;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public PublicationType getType() { return type; }
    public String getVerificationQuestion() { return verificationQuestion; }
    public String getVerificationAnswer() { return verificationAnswer; }
    public String getBarrio() { return barrio; }
    public String getAddress() { return address; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public LocalDateTime getEventDate() { return eventDate; }
}
