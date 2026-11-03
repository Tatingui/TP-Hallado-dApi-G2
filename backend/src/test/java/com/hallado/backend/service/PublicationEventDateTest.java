package com.hallado.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hallado.backend.dto.CreatePublicationRequest;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.model.User;
import com.hallado.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Fecha y hora del suceso (Punto 5). */
@DataJpaTest(properties = {"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop"})
@Import(PublicationService.class)
class PublicationEventDateTest {

    private final ObjectMapper json = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    @Autowired PublicationService publications;
    @Autowired UserRepository users;

    @Test
    void guardaExactamenteLaHoraLocalQueEnviaLaApp() throws Exception {
        CreatePublicationRequest request = json.readValue("""
                {"title":"Llaves perdidas","type":"LOST","category":"KEYS","barrio":"Palermo",
                 "eventDate":"2026-01-15T21:30:00"}
                """, CreatePublicationRequest.class);

        PublicationResponseDTO creada = publications.createPublication(request, null, usuario());

        assertEquals(LocalDateTime.of(2026, 1, 15, 21, 30), creada.getEventDate());
    }

    @Test
    void rechazaUnaFechaDelSucesoFutura() {
        CreatePublicationRequest request = new CreatePublicationRequest();
        request.setTitle("Llaves perdidas");
        request.setType(com.hallado.backend.model.PublicationType.LOST);
        request.setCategory(com.hallado.backend.model.CategoryEnum.KEYS);
        request.setBarrio("Palermo");
        request.setEventDate(LocalDateTime.now().plusDays(1));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> publications.createPublication(request, null, usuario()));
        assertEquals("La fecha y hora del suceso no pueden ser futuras", error.getMessage());
    }

    private String usuario() {
        return users.save(new User("Test", UUID.randomUUID() + "@example.com", "hash")).getEmail();
    }
}
