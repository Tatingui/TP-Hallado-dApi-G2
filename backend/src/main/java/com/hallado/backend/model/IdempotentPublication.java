package com.hallado.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "idempotent_publications")
public class IdempotentPublication {
    @Id @Column(length = 64)
    private String id;
    @Column(nullable = false, length = 64)
    private String requestHash;
    @Lob @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String responseJson;
    protected IdempotentPublication() {}
    public IdempotentPublication(String id, String requestHash, String responseJson) {
        this.id = id; this.requestHash = requestHash; this.responseJson = responseJson;
    }
    public String getRequestHash() { return requestHash; }
    public String getResponseJson() { return responseJson; }
}
