package com.hallado.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hallado.backend.dto.ClaimRequestDTO;
import com.hallado.backend.dto.ClaimResponseDTO;
import com.hallado.backend.dto.RatingRequestDTO;
import com.hallado.backend.dto.ResolvedCaseDTO;
import com.hallado.backend.exception.BadRequestException;
import com.hallado.backend.exception.ForbiddenException;
import com.hallado.backend.model.*;
import com.hallado.backend.repository.ClaimRepository;
import com.hallado.backend.repository.PublicationFollowRepository;
import com.hallado.backend.repository.PublicationRepository;
import com.hallado.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Puntos 7 y 8: datos del reclamo y su ciclo de vida desde que se acepta hasta la entrega o la cancelación. */
@DataJpaTest(properties = {"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop"})
@Import({ClaimService.class, PublicationService.class, UserLookupService.class, FileStorageService.class, ClaimLifecycleTest.JsonConfig.class})
class ClaimLifecycleTest {

    @TestConfiguration
    static class JsonConfig {
        @Bean ObjectMapper objectMapper() { return JsonMapper.builder().addModule(new JavaTimeModule()).build(); }
    }

    @Autowired ClaimService claims;
    @Autowired ClaimRepository claimRepository;
    @Autowired PublicationRepository publications;
    @Autowired PublicationFollowRepository follows;
    @Autowired UserRepository users;

    @Test
    void aceptarNoSumaLaDevolucionHastaQueSeConfirmaLaEntrega() {
        Caso caso = casoAceptado();
        assertEquals(PublicationStatus.IN_CLAIM, estadoDe(caso.publicacion));
        assertEquals(0, devolucionesDe(caso.publicador));
        assertTrue(claims.getResolvedHistory(caso.reclamante.getEmail(), null, null, null).isEmpty());

        ClaimResponseDTO entregado = claims.confirmDelivery(caso.reclamo.getId(), caso.publicador.getEmail());

        assertEquals("RESOLVED", entregado.getPublicationStatus());
        assertFalse(entregado.isCanCloseDelivery());
        assertEquals(PublicationStatus.RESOLVED, estadoDe(caso.publicacion));
        assertEquals(1, devolucionesDe(caso.publicador), "en un hallazgo devuelve el publicador");
        assertEquals(1, claims.getResolvedHistory(caso.reclamante.getEmail(), null, null, null).size());
    }

    @Test
    void acordarElPuntoDeEncuentroNoCierraElCaso() {
        Caso caso = casoAceptado();
        claims.proposeMeetingPoint(caso.reclamo.getId(), "Plaza Serrano", caso.publicador.getEmail());
        claims.acceptMeetingPoint(caso.reclamo.getId(), caso.reclamante.getEmail());

        assertEquals(PublicationStatus.IN_CLAIM, estadoDe(caso.publicacion));
        assertEquals(0, devolucionesDe(caso.publicador));
    }

    @Test
    void cancelarYVolverAPublicarReabreLaPublicacion() {
        Caso caso = casoAceptado();

        ClaimResponseDTO cancelado = claims.cancelAcceptedClaim(caso.reclamo.getId(), true, caso.publicador.getEmail());

        assertEquals(ClaimStatus.CANCELLED, cancelado.getStatus());
        assertEquals(PublicationStatus.OPEN, estadoDe(caso.publicacion));
        assertEquals(0, devolucionesDe(caso.publicador));
    }

    @Test
    void cancelarEliminandoLaPublicacionBorraTambienSusReclamosYSeguimientos() {
        Caso caso = casoAceptado();
        User otro = usuario();
        Claim rechazado = new Claim(caso.publicacion, otro, "Creo que es mía", null);
        rechazado.setStatus(ClaimStatus.REJECTED);
        claimRepository.save(rechazado);
        follows.save(new PublicationFollow(otro, caso.publicacion));

        assertNull(claims.cancelAcceptedClaim(caso.reclamo.getId(), false, caso.publicador.getEmail()));

        assertFalse(publications.existsById(caso.publicacion.getId()));
        assertTrue(claimRepository.findByPublication(caso.publicacion).isEmpty());
        assertTrue(follows.findByPublication(caso.publicacion).isEmpty());
    }

    @Test
    void soloElPublicadorPuedeCerrarLaEntregaYUnaSolaVez() {
        Caso caso = casoAceptado();
        assertThrows(ForbiddenException.class,
                () -> claims.confirmDelivery(caso.reclamo.getId(), caso.reclamante.getEmail()));

        claims.confirmDelivery(caso.reclamo.getId(), caso.publicador.getEmail());
        assertThrows(BadRequestException.class,
                () -> claims.cancelAcceptedClaim(caso.reclamo.getId(), true, caso.publicador.getEmail()));
    }

    @Test
    void responderSoloAceptaORechaza() {
        Caso caso = casoPendiente();
        assertThrows(BadRequestException.class,
                () -> claims.respondToClaim(caso.reclamo.getId(), ClaimStatus.CANCELLED, caso.publicador.getEmail()));
    }

    @Test
    void noSeAceptaUnReclamoSiLaPublicacionYaVencio() {
        Caso caso = casoPendiente();
        caso.publicacion.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        publications.saveAndFlush(caso.publicacion);

        assertThrows(BadRequestException.class,
                () -> claims.respondToClaim(caso.reclamo.getId(), ClaimStatus.ACCEPTED, caso.publicador.getEmail()));
    }

    @Test
    void volverAPublicarRenuevaSiElPlazoTerminoDuranteElReclamo() {
        Caso caso = casoAceptado();
        caso.publicacion.setExpiresAt(LocalDateTime.now().minusDays(1));
        publications.saveAndFlush(caso.publicacion);

        claims.cancelAcceptedClaim(caso.reclamo.getId(), true, caso.publicador.getEmail());

        Publication reabierta = publications.findById(caso.publicacion.getId()).orElseThrow();
        assertEquals(PublicationStatus.OPEN, reabierta.getStatus());
        assertTrue(reabierta.getExpiresAt().isAfter(LocalDateTime.now().plusDays(Publication.VIGENCIA_DIAS - 1)));
    }

    @Test
    void noSeAceptaElPuntoDeEncuentroDeUnReclamoCancelado() {
        Caso caso = casoAceptado();
        claims.proposeMeetingPoint(caso.reclamo.getId(), "Plaza Serrano", caso.publicador.getEmail());
        claims.cancelAcceptedClaim(caso.reclamo.getId(), true, caso.publicador.getEmail());

        assertThrows(BadRequestException.class,
                () -> claims.acceptMeetingPoint(caso.reclamo.getId(), caso.reclamante.getEmail()));
    }

    @Test
    void elTelefonoDelReclamanteRespetaSuVisibilidad() {
        Caso caso = casoPendiente();
        caso.reclamante.setTelefono("1122334455");
        caso.reclamante.setTelefonoVisible(false);
        users.saveAndFlush(caso.reclamante);

        ClaimResponseDTO aceptado = claims.respondToClaim(caso.reclamo.getId(), ClaimStatus.ACCEPTED, caso.publicador.getEmail());

        assertNull(aceptado.getClaimant().getPhone());
    }

    @Test
    void loEncontreExigeElBarrioDondeSeEncontro() {
        User publicador = usuario();
        Publication perdida = publications.saveAndFlush(new Publication("Perdí mis llaves", "Llavero rojo",
                PublicationType.LOST, CategoryEnum.KEYS, "Palermo", null, null, null,
                LocalDateTime.now().minusDays(1), null, publicador));
        ClaimRequestDTO sinBarrio = new ClaimRequestDTO();
        sinBarrio.setProofMessage("Estaban en la plaza");

        BadRequestException error = assertThrows(BadRequestException.class,
                () -> claims.createClaim(perdida.getId(), sinBarrio, null, usuario().getEmail()));
        assertTrue(error.getMessage().contains("barrio"));
    }

    @Test
    void historialIncluyeLosMensajesDeAmbasValoraciones() {
        Caso caso = casoAceptado();
        claims.confirmDelivery(caso.reclamo.getId(), caso.publicador.getEmail());

        RatingRequestDTO valoracionDelPublicador = new RatingRequestDTO();
        valoracionDelPublicador.setPositive(true);
        valoracionDelPublicador.setMessage("Mensaje del publicador");
        claims.rateResolvedCase(caso.reclamo.getId(), valoracionDelPublicador, caso.publicador.getEmail());

        RatingRequestDTO valoracionDelReclamante = new RatingRequestDTO();
        valoracionDelReclamante.setPositive(true);
        valoracionDelReclamante.setMessage("Mensaje del reclamante");
        claims.rateResolvedCase(caso.reclamo.getId(), valoracionDelReclamante, caso.reclamante.getEmail());

        ResolvedCaseDTO historial = claims
                .getResolvedHistory(caso.reclamante.getEmail(), null, null, null)
                .get(0);

        assertEquals("Mensaje del reclamante", historial.getRatingMessage());
        assertEquals("Mensaje del publicador", historial.getCounterpartRatingMessage());
    }

    private record Caso(User publicador, User reclamante, Publication publicacion, Claim reclamo) {}

    private Caso casoPendiente() {
        User publicador = usuario();
        User reclamante = usuario();
        Publication publicacion = publications.saveAndFlush(new Publication("Billetera encontrada", "Marrón",
                PublicationType.FOUND, CategoryEnum.DOCUMENTS, "Palermo", "Honduras 4800", null, null,
                LocalDateTime.now().minusDays(1), null, publicador));
        Claim reclamo = claimRepository.save(new Claim(publicacion, reclamante, "Es mía", null));
        return new Caso(publicador, reclamante, publicacion, reclamo);
    }

    private Caso casoAceptado() {
        Caso caso = casoPendiente();
        claims.respondToClaim(caso.reclamo.getId(), ClaimStatus.ACCEPTED, caso.publicador.getEmail());
        return caso;
    }

    private PublicationStatus estadoDe(Publication publicacion) {
        return publications.findById(publicacion.getId()).orElseThrow().getStatus();
    }

    private int devolucionesDe(User usuario) {
        return users.findById(usuario.getId()).orElseThrow().getDevolucionesConcretadas();
    }

    private User usuario() {
        return users.save(new User("Test", UUID.randomUUID() + "@example.com", "hash"));
    }
}
