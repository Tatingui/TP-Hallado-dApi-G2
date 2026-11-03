package com.hallado.backend.service;

import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.exception.BadRequestException;
import com.hallado.backend.exception.ForbiddenException;
import com.hallado.backend.model.*;
import com.hallado.backend.repository.ClaimRepository;
import com.hallado.backend.repository.PublicationRepository;
import com.hallado.backend.repository.PublicationSpecification;
import com.hallado.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Punto 5: vencimiento a los 30 días y renovación. */
@DataJpaTest(properties = {"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop"})
@Import({PublicationService.class, UserLookupService.class, FileStorageService.class, PublicationExpirationService.class})
class PublicationExpirationTest {

    @Autowired PublicationExpirationService expiration;
    @Autowired PublicationService publications;
    @Autowired PublicationRepository repository;
    @Autowired UserRepository users;
    @Autowired ClaimRepository claims;

    @Test
    void unaPublicacionNuevaVenceALos30Dias() {
        Publication nueva = publicacion(usuario(), PublicationStatus.OPEN, null);
        assertEquals(nueva.getCreatedAt().plusDays(Publication.VIGENCIA_DIAS), nueva.getExpiresAt());
    }

    @Test
    void venceSoloLasAbiertasCuyaVigenciaTermino() {
        User duenio = usuario();
        Publication vencida = publicacion(duenio, PublicationStatus.OPEN, LocalDateTime.now().minusMinutes(1));
        Publication vigente = publicacion(duenio, PublicationStatus.OPEN, LocalDateTime.now().plusDays(1));
        Publication enReclamo = publicacion(duenio, PublicationStatus.IN_CLAIM, LocalDateTime.now().minusDays(1));

        expiration.expireOverduePublications();

        assertEquals(PublicationStatus.EXPIRED, estado(vencida));
        assertEquals(PublicationStatus.OPEN, estado(vigente));
        assertEquals(PublicationStatus.IN_CLAIM, estado(enReclamo), "un reclamo en curso no se corta por vencimiento");
    }

    @Test
    void alVencerseTambienVencenSusReclamosPendientes() {
        User duenio = usuario();
        Publication vencida = publicacion(duenio, PublicationStatus.OPEN, LocalDateTime.now().minusMinutes(1));
        Claim pendiente = claims.save(new Claim(vencida, usuario(), "Es mío", null));

        expiration.expireOverduePublications();

        assertEquals(ClaimStatus.EXPIRED, claims.findById(pendiente.getId()).orElseThrow().getStatus());
    }

    @Test
    void laBusquedaNoMuestraVencidasAunqueLaTareaTodaviaNoHayaCorrido() {
        User duenio = usuario();
        Publication vencida = publicacion(duenio, PublicationStatus.OPEN, LocalDateTime.now().minusMinutes(1));
        Publication vigente = publicacion(duenio, PublicationStatus.OPEN, LocalDateTime.now().plusDays(1));

        var encontradas = repository.findAll(PublicationSpecification.buildSearchSpecification(
                null, null, null, null, null, null));

        assertTrue(encontradas.stream().anyMatch(p -> p.getId().equals(vigente.getId())));
        assertTrue(encontradas.stream().noneMatch(p -> p.getId().equals(vencida.getId())));
    }

    @Test
    void elDuenioRenuevaUnaVencidaPorOtros30Dias() {
        User duenio = usuario();
        Publication vencida = publicacion(duenio, PublicationStatus.EXPIRED, LocalDateTime.now().minusDays(2));

        PublicationResponseDTO renovada = publications.renewPublication(vencida.getId(), duenio.getEmail());

        assertEquals(PublicationStatus.OPEN, renovada.getStatus());
        assertTrue(renovada.getExpiresAt().isAfter(LocalDateTime.now().plusDays(Publication.VIGENCIA_DIAS - 1)));
    }

    @Test
    void tambienRenuevaUnaAbiertaYaVencidaQueLaTareaTodaviaNoMarco() {
        User duenio = usuario();
        Publication vencida = publicacion(duenio, PublicationStatus.OPEN, LocalDateTime.now().minusMinutes(1));

        assertEquals(PublicationStatus.OPEN, publications.renewPublication(vencida.getId(), duenio.getEmail()).getStatus());
    }

    @Test
    void noSeRenuevaUnaPublicacionVigente() {
        User duenio = usuario();
        Publication vigente = publicacion(duenio, PublicationStatus.OPEN, LocalDateTime.now().plusDays(10));

        assertThrows(BadRequestException.class,
                () -> publications.renewPublication(vigente.getId(), duenio.getEmail()));
    }

    @Test
    void soloElDuenioPuedeRenovar() {
        Publication vencida = publicacion(usuario(), PublicationStatus.EXPIRED, LocalDateTime.now().minusDays(1));

        assertThrows(ForbiddenException.class,
                () -> publications.renewPublication(vencida.getId(), usuario().getEmail()));
    }

    private PublicationStatus estado(Publication publicacion) {
        return repository.findById(publicacion.getId()).orElseThrow().getStatus();
    }

    private User usuario() {
        return users.save(new User("Test", UUID.randomUUID() + "@example.com", "hash"));
    }

    private Publication publicacion(User duenio, PublicationStatus estado, LocalDateTime vence) {
        Publication publicacion = new Publication("Llaves perdidas", "Llavero rojo", PublicationType.LOST,
                CategoryEnum.KEYS, "Palermo", null, null, null, LocalDateTime.now().minusDays(1), null, duenio);
        publicacion.setStatus(estado);
        publicacion.setExpiresAt(vence);
        return repository.save(publicacion);
    }
}
