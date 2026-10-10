package com.hallado.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class OtpRequest {

    @NotBlank(message = "El email es obligatorio")
    private String email;

    @NotBlank(message = "El codigo es obligatorio")
    private String code;

    public OtpRequest() {}
    public OtpRequest(String email, String code) {
        this.email = email;
        this.code = code;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
