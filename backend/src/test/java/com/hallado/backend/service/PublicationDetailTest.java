package com.hallado.backend.service;

import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.ClaimStatus;
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
    private ClaimRepository claimRepository;
    private PublicationService publicationService;
    private Publication publication;

    @BeforeEach
    void setUp() {
        publicationRepository = mock(PublicationRepository.class);
        claimRepository = mock(ClaimRepository.class);
        publicationService = new PublicationService(
                publicationRepository,
                mock(UserLookupService.class),
                mock(FileStorageService.class),
                claimRepository,
                mock(PublicationFollowRepository.class));

        User owner = new User("Ana", "ana@example.com", "password");
        publication = new Publication(
                "Llaves perdidas",
                "Descripción de prueba",
                PublicationType.LOST,
                CategoryEnum.KEYS,
                "Palermo",
                "Av. Corrientes 1234",
                -34.603722,
                -58.381592,
                null,
                null,
                owner);
        when(publicationRepository.findById(1L)).thenReturn(Optional.of(publication));
    }

    @Test
    void incluyeLaDireccionParaElDueño() {
        var result = publicationService.getPublicationById(1L, "ANA@example.com");

        assertTrue(result.isMine());
        assertTrue(result.isAddressVisible());
        assertEquals("Av. Corrientes 1234", result.getAddress());
        assertEquals(-34.603722, result.getLatitude());
        assertEquals(-58.381592, result.getLongitude());
    }

    @Test
    void muestraLaDireccionAlReclamanteAceptado() {
        when(claimRepository.existsByPublicationAndClaimant_EmailIgnoreCaseAndStatus(
                publication, "reclamante@example.com", ClaimStatus.ACCEPTED)).thenReturn(true);

        var result = publicationService.getPublicationById(1L, "reclamante@example.com");

        assertFalse(result.isMine());
        assertTrue(result.isAddressVisible());
        assertEquals("Av. Corrientes 1234", result.getAddress());
        assertEquals(-34.603722, result.getLatitude());
        assertEquals(-58.381592, result.getLongitude());
    }

    @Test
    void ocultaLaDireccionParaUnReclamoPendiente() {
        when(claimRepository.existsByPublicationAndClaimant_EmailIgnoreCaseAndStatus(
                publication, "reclamante@example.com", ClaimStatus.ACCEPTED)).thenReturn(false);

        var result = publicationService.getPublicationById(1L, "reclamante@example.com");

        assertFalse(result.isMine());
        assertFalse(result.isAddressVisible());
        assertNull(result.getAddress());
        assertNull(result.getLatitude());
        assertNull(result.getLongitude());
    }

    @Test
    void ocultaLaDireccionParaOtrosUsuarios() {
        var result = publicationService.getPublicationById(1L, "otra@example.com");

        assertFalse(result.isMine());
        assertFalse(result.isAddressVisible());
        assertNull(result.getAddress());
        assertNull(result.getLatitude());
        assertNull(result.getLongitude());
    }
}
