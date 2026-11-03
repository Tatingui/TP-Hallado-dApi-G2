package com.hallado.backend.service;

import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.User;
import com.hallado.backend.repository.ClaimRepository;
import com.hallado.backend.repository.PublicationFollowRepository;
import com.hallado.backend.repository.PublicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PublicationDetailTest {

    private PublicationRepository publicationRepository;
    private PublicationService publicationService;
    private Publication publication;

    @BeforeEach
    void setUp() {
        publicationRepository = mock(PublicationRepository.class);
        publicationService = new PublicationService(
                publicationRepository,
                mock(UserLookupService.class),
                mock(FileStorageService.class),
                mock(ClaimRepository.class),
                mock(PublicationFollowRepository.class));

        User owner = new User("Ana", "ana@example.com", "password");
        publication = new Publication(
                "Llaves perdidas",
                "Descripción de prueba",
                PublicationType.LOST,
                CategoryEnum.KEYS,
                "Palermo",
                "Av. Corrientes 1234",
                null,
                null,
                null,
                null,
                owner);
        when(publicationRepository.findById(1L)).thenReturn(Optional.of(publication));
    }

    @Test
    void incluyeLaDireccionParaElDueño() {
        var result = publicationService.getPublicationById(1L, "ANA@example.com");

        assertTrue(result.isMine());
        assertEquals("Av. Corrientes 1234", result.getAddress());
    }

    @Test
    void ocultaLaDireccionParaOtrosUsuarios() {
        var result = publicationService.getPublicationById(1L, "otra@example.com");

        assertFalse(result.isMine());
        assertNull(result.getAddress());
    }
}
