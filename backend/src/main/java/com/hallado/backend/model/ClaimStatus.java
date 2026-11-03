package com.hallado.backend.model;

public enum ClaimStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    EXPIRED,
    /** El publicador canceló un reclamo ya aceptado y volvió a abrir la publicación. */
    CANCELLED
}
