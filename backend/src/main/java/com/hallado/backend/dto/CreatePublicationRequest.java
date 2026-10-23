package com.hallado.backend.dto;

import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.PublicationType;

import java.time.LocalDateTime;

/**
 * DTO para la creación de una publicación (Punto 5).
 * Recibido como JSON en el campo "publication" del multipart.
 */
public class CreatePublicationRequest {

    private String title;
    private String description;
    private PublicationType type;
    private CategoryEnum category;
    private String barrio;
    private String address;
    private Double latitude;
    private Double longitude;
    private LocalDateTime eventDate;
    private String verificationQuestion;
    private String verificationAnswer;

    public CreatePublicationRequest() {}

    // Getters y Setters
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

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public String getVerificationQuestion() { return verificationQuestion; }
    public void setVerificationQuestion(String verificationQuestion) { this.verificationQuestion = verificationQuestion; }

    public String getVerificationAnswer() { return verificationAnswer; }
    public void setVerificationAnswer(String verificationAnswer) { this.verificationAnswer = verificationAnswer; }
}
