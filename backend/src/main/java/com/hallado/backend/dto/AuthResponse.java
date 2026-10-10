package com.hallado.backend.dto;

public class AuthResponse {

    private String token;
    private String message;
    private boolean success;
    private boolean requiresVerification;

    public AuthResponse() {
    }

    public AuthResponse(String token, String message, boolean success) {
        this.token = token;
        this.message = message;
        this.success = success;
        this.requiresVerification = false;
    }

    public static AuthResponse ok(String token, String message) {
        return new AuthResponse(token, message, true);
    }

    public static AuthResponse error(String message) {
        return new AuthResponse(null, message, false);
    }

    public static AuthResponse pendingVerification(String message) {
        AuthResponse response = new AuthResponse(null, message, false);
        response.setRequiresVerification(true);
        return response;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public boolean isRequiresVerification() { return requiresVerification; }
    public void setRequiresVerification(boolean requiresVerification) { this.requiresVerification = requiresVerification; }
}
