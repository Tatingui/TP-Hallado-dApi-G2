package com.hallado.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hallado.backend.dto.FollowStatusDTO;
import com.hallado.backend.dto.SeenStatusDTO;
import com.hallado.backend.model.*;
import com.hallado.backend.repository.PublicationRepository;
import com.hallado.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Punto 9: seguir publicaciones y detectar novedades. */
@DataJpaTest(properties = {"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop"})
@Import({PublicationFollowService.class, UserLookupService.class})
class PublicationFollowServiceTest {

    @Autowired PublicationFollowService follows;
    @Autowired PublicationRepository publications;
    @Autowired UserRepository users;

    @Test
    void seguirEsIdempotenteYDejarDeSeguirLoRevierte() {
        String email = usuario().getEmail();
        Publication publicacion = publicacion();

        follows.follow(email, publicacion.getId());
        FollowStatusDTO estado = follows.follow(email, publicacion.getId());
        assertTrue(estado.followed());
        assertEquals(1, estado.followersCount());

        FollowStatusDTO despues = follows.unfollow(email, publicacion.getId());
        assertFalse(despues.followed());
        assertEquals(0, despues.followersCount());
    }

    @Test
    void unCambioDeEstadoEsNovedadHastaQueSeMarcaComoVista() {
        String email = usuario().getEmail();
        Publication publicacion = publicacion();
        follows.follow(email, publicacion.getId());
        assertEquals(0, follows.countWithUpdates(email));

        publicacion.setStatus(PublicationStatus.IN_CLAIM);
        publications.saveAndFlush(publicacion);
        assertTrue(follows.getStatus(email, publicacion.getId()).hasNewUpdates());
        assertEquals(1, follows.countWithUpdates(email));

        assertTrue(follows.markAsSeen(email, publicacion.getId()).seen());
        assertFalse(follows.getStatus(email, publicacion.getId()).hasNewUpdates());
        assertEquals(0, follows.countWithUpdates(email));
    }

    @Test
    void marcarComoVistaUnaPublicacionNoSeguida() {
        SeenStatusDTO resultado = follows.markAsSeen(usuario().getEmail(), publicacion().getId());
        assertFalse(resultado.seen());
        assertNotNull(resultado.message());
    }

    @Test
    void elJsonConservaLasClavesQueUsaLaApp() throws Exception {
        ObjectMapper json = JsonMapper.builder().addModule(new JavaTimeModule()).build();

        assertEquals("{\"followed\":true,\"followersCount\":3,\"hasNewUpdates\":false}",
                json.writeValueAsString(new FollowStatusDTO(true, 3, false)));
        assertEquals("{\"seen\":false,\"message\":\"La publicación no está siendo seguida por este usuario.\"}",
                json.writeValueAsString(SeenStatusDTO.noSeguida()));
    }

    private User usuario() {
        return users.save(new User("Test", UUID.randomUUID() + "@example.com", "hash"));
    }

    private Publication publicacion() {
        return publications.saveAndFlush(new Publication("Llaves perdidas", "Llavero rojo", PublicationType.LOST,
                CategoryEnum.KEYS, "Palermo", null, null, null, LocalDateTime.now().minusDays(1), null, usuario()));
    }
}
