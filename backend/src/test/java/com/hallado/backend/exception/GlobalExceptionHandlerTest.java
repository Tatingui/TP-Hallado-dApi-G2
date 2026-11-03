package com.hallado.backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    @RestController
    static class ControllerDePrueba {
        @GetMapping("/conflicto")
        void conflicto() {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La clave ya corresponde a otra publicación");
        }

        @GetMapping("/inesperado")
        void inesperado() {
            throw new IllegalStateException("detalle interno de la base de datos");
        }

        @GetMapping("/validacion")
        void validacion() {
            throw new BadRequestException("El barrio es obligatorio");
        }
    }

    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new ControllerDePrueba())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void respetaElCodigoDeUnaResponseStatusException() throws Exception {
        mvc.perform(get("/conflicto"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("La clave ya corresponde a otra publicación"));
    }

    @Test
    void unErrorInesperadoNoExponeDetallesInternos() throws Exception {
        mvc.perform(get("/inesperado"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message", not(containsString("detalle interno"))));
    }

    @Test
    void losErroresDeValidacionDevuelven400ConSuMensaje() throws Exception {
        mvc.perform(get("/validacion"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El barrio es obligatorio"));
    }
}
