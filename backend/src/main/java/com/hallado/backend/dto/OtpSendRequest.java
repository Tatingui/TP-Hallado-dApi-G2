package com.hallado.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class OtpSendRequest {

    @NotBlank(message = "El email es obligatorio")
    private String email;

    public OtpSendRequest() {}
    public OtpSendRequest(String email) { this.email = email; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
