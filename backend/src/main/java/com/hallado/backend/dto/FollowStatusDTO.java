package com.hallado.backend.dto;

/**
 * Punto 9: estado del seguimiento de una publicación para el usuario autenticado.
 *
 * @param followed       si el usuario la sigue
 * @param followersCount cantidad total de seguidores
 * @param hasNewUpdates  si cambió de estado desde la última vez que el usuario la vio
 */
public record FollowStatusDTO(boolean followed, long followersCount, boolean hasNewUpdates) {
}
