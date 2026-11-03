package com.hallado.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hallado.backend.dto.CreatePublicationRequest;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.service.IdempotentPublicationService;
import com.hallado.backend.service.PublicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Punto 5: la publicación llega como campo "publication" del multipart, con o sin fotos. */
class PublicationControllerCreateTest {

    private static final String PUBLICACION =
            "{\"title\":\"Llaves perdidas\",\"type\":\"LOST\",\"category\":\"KEYS\",\"barrio\":\"Palermo\"}";

    private final ObjectMapper json = JsonMapper.builder().addModule(new JavaTimeModule()).build();
    private IdempotentPublicationService idempotentPublications;
    private MockMvc mvc;

    @BeforeEach
    void setUp() throws Exception {
        idempotentPublications = mock(IdempotentPublicationService.class);
        when(idempotentPublications.create(any(), any(), any(), any())).thenReturn(new PublicationResponseDTO());
        PublicationController controller =
                new PublicationController(mock(PublicationService.class), json, idempotentPublications);
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @SuppressWarnings("unchecked")
    void creaUnaPublicacionSinFotos() throws Exception {
        mvc.perform(multipart("/publications")
                        .param("publication", PUBLICACION)
                        .header("X-Idempotency-Key", "clave")
                        .principal(new UsernamePasswordAuthenticationToken("ana@example.com", null)))
                .andExpect(status().isCreated());

        ArgumentCaptor<CreatePublicationRequest> request = ArgumentCaptor.forClass(CreatePublicationRequest.class);
        ArgumentCaptor<List> imagenes = ArgumentCaptor.forClass(List.class);
        verify(idempotentPublications).create(request.capture(), imagenes.capture(), eq("ana@example.com"), eq("clave"));
        assertEquals("Llaves perdidas", request.getValue().getTitle());
        assertTrue(imagenes.getValue() == null || imagenes.getValue().isEmpty());
    }

    @Test
    @SuppressWarnings("unchecked")
    void creaUnaPublicacionConFotos() throws Exception {
        MockMultipartFile foto = new MockMultipartFile("images", "a.jpg", "image/jpeg", new byte[]{1, 2, 3});

        mvc.perform(multipart("/publications")
                        .file(foto)
                        .param("publication", PUBLICACION)
                        .principal(new UsernamePasswordAuthenticationToken("ana@example.com", null)))
                .andExpect(status().isCreated());

        ArgumentCaptor<List> imagenes = ArgumentCaptor.forClass(List.class);
        verify(idempotentPublications).create(any(), imagenes.capture(), eq("ana@example.com"), isNull());
        assertEquals(1, imagenes.getValue().size());
    }
}
