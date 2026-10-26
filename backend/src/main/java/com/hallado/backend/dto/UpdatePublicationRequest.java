package com.hallado.backend.dto;

import java.time.LocalDateTime;

public class UpdatePublicationRequest {
    private String title;
    private String description;
    private String verificationQuestion;
    private String verificationAnswer;
    private String barrio;
    private String address;
    private Double latitude;
    private Double longitude;
    private LocalDateTime eventDate;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getVerificationQuestion() { return verificationQuestion; }
    public void setVerificationQuestion(String verificationQuestion) { this.verificationQuestion = verificationQuestion; }
    public String getVerificationAnswer() { return verificationAnswer; }
    public void setVerificationAnswer(String verificationAnswer) { this.verificationAnswer = verificationAnswer; }
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
}
