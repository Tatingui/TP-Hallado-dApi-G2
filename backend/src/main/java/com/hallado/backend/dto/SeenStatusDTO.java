package com.hallado.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * Punto 9: resultado de marcar una publicación seguida como vista.
 * Los campos nulos no se envían.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SeenStatusDTO(boolean seen, String message, LocalDateTime lastSeenAt) {

    public static SeenStatusDTO vista(LocalDateTime lastSeenAt) {
        return new SeenStatusDTO(true, null, lastSeenAt);
    }

    public static SeenStatusDTO noSeguida() {
        return new SeenStatusDTO(false, "La publicación no está siendo seguida por este usuario.", null);
    }
}
