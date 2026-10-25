package com.hallado.backend.dto;

public class ClaimRequestDTO {

    private String proofMessage;
    private String verificationAnswer; // Respuesta ingresada por el reclamante

    public ClaimRequestDTO() {}

    public String getProofMessage() { return proofMessage; }
    public void setProofMessage(String proofMessage) { this.proofMessage = proofMessage; }

    public String getVerificationAnswer() { return verificationAnswer; }
    public void setVerificationAnswer(String verificationAnswer) { this.verificationAnswer = verificationAnswer; }
}
