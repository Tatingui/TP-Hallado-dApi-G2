package com.hallado.backend.service;

import com.hallado.backend.config.SchedulingConfig;
import com.hallado.backend.model.*;
import com.hallado.backend.repository.ClaimRepository;
import com.hallado.backend.repository.PublicationRepository;
import com.hallado.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop"})
@Import(ClaimSchedulerService.class)
class ClaimSchedulerServiceTest {

    @Autowired ClaimSchedulerService scheduler;
    @Autowired ClaimRepository claims;
    @Autowired PublicationRepository publications;
    @Autowired UserRepository users;

    @Test
    void venceSoloLosReclamosPendientesDeMasDe48Horas() {
        User duenio = users.save(new User("Dueño", UUID.randomUUID() + "@example.com", "hash"));
        User reclamante = users.save(new User("Reclamante", UUID.randomUUID() + "@example.com", "hash"));
        Publication publicacion = publications.save(new Publication(
                "Llaves", "Llavero rojo", PublicationType.FOUND, CategoryEnum.KEYS,
                "Palermo", null, null, null, LocalDateTime.now(), null, duenio));

        Claim viejo = reclamo(publicacion, reclamante, ClaimStatus.PENDING, 49);
        Claim reciente = reclamo(publicacion, reclamante, ClaimStatus.PENDING, 47);
        Claim yaAceptado = reclamo(publicacion, reclamante, ClaimStatus.ACCEPTED, 72);

        scheduler.expireOldClaims();

        assertEquals(ClaimStatus.EXPIRED, claims.findById(viejo.getId()).orElseThrow().getStatus());
        assertEquals(ClaimStatus.PENDING, claims.findById(reciente.getId()).orElseThrow().getStatus());
        assertEquals(ClaimStatus.ACCEPTED, claims.findById(yaAceptado.getId()).orElseThrow().getStatus());
    }

    @Test
    void laTareaQuedaProgramadaPorqueElSchedulingEstaHabilitado() throws NoSuchMethodException {
        assertNotNull(SchedulingConfig.class.getAnnotation(EnableScheduling.class));
        assertNotNull(ClaimSchedulerService.class.getMethod("expireOldClaims").getAnnotation(Scheduled.class));
    }

    private Claim reclamo(Publication publicacion, User reclamante, ClaimStatus estado, int horasAtras) {
        Claim claim = new Claim(publicacion, reclamante, "Es mío", null);
        claim.setStatus(estado);
        claim.setClaimDate(LocalDateTime.now().minusHours(horasAtras));
        return claims.save(claim);
    }
}
