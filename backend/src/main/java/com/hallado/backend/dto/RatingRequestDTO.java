package com.hallado.backend.dto;

public class RatingRequestDTO {
    private Boolean positive;
    private String message;
    private String publicThanks;

    public Boolean getPositive() { return positive; }
    public void setPositive(Boolean positive) { this.positive = positive; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPublicThanks() { return publicThanks; }
    public void setPublicThanks(String publicThanks) { this.publicThanks = publicThanks; }
}
