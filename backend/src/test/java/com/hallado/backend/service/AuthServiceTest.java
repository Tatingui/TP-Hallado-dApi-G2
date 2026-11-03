package com.hallado.backend.service;

import com.hallado.backend.config.JwtUtil;
import com.hallado.backend.dto.AuthResponse;
import com.hallado.backend.dto.CompleteRegistrationRequest;
import com.hallado.backend.dto.OtpRequest;
import com.hallado.backend.dto.OtpSendRequest;
import com.hallado.backend.dto.ResetPasswordRequest;
import com.hallado.backend.model.User;
import com.hallado.backend.repository.PendingRegistrationRepository;
import com.hallado.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DataJpaTest(properties = {
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "jwt.secret=ClaveDeTestParaFirmarTokensJwtDeHalladoConLongitudSuficiente1234",
        "jwt.expiration-ms=60000"
})
@Import({AuthService.class, JwtUtil.class, AuthServiceTest.Config.class})
class AuthServiceTest {

    private static final String PASSWORD = "Segura1!";

    @TestConfiguration
    static class Config {
        @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    }

    @MockBean EmailService emailService;
    @Autowired AuthService auth;
    @Autowired UserRepository users;
    @Autowired PendingRegistrationRepository pendingRegistrations;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void registroEnTresPasosCreaElUsuarioVerificadoAlFinal() {
        String email = emailNuevo();

        assertTrue(auth.startRegistration(new OtpSendRequest(email)).isSuccess());
        assertTrue(users.findByEmail(email).isEmpty(), "el usuario no existe hasta completar el registro");

        String codigo = ultimoCodigoEnviadoA(email);
        assertTrue(auth.verifyRegistrationCode(new OtpRequest(email, codigo)).isSuccess());

        AuthResponse respuesta = auth.completeRegistration(
                new CompleteRegistrationRequest(email, codigo, "  Ana  ", PASSWORD));

        assertTrue(respuesta.isSuccess());
        assertNotNull(respuesta.getToken());
        User user = users.findByEmail(email).orElseThrow();
        assertTrue(user.isEmailVerified());
        assertEquals("Ana", user.getNombre());
        assertTrue(passwordEncoder.matches(PASSWORD, user.getPassword()));
        assertTrue(pendingRegistrations.findByEmail(email).isEmpty());
    }

    @Test
    void noPermiteRegistrarUnEmailExistente() {
        String email = usuarioExistente();
        AuthResponse respuesta = auth.startRegistration(new OtpSendRequest(email));
        assertFalse(respuesta.isSuccess());
        assertEquals("El email ya está registrado", respuesta.getMessage());
    }

    @Test
    void noPermiteCompletarSinHaberValidadoElCodigo() {
        String email = emailNuevo();
        auth.startRegistration(new OtpSendRequest(email));
        String codigo = ultimoCodigoEnviadoA(email);

        AuthResponse respuesta = auth.completeRegistration(
                new CompleteRegistrationRequest(email, codigo, "Ana", PASSWORD));

        assertFalse(respuesta.isSuccess());
        assertTrue(users.findByEmail(email).isEmpty());
    }

    @Test
    void reenviarElCodigoInvalidaElAnterior() {
        String email = emailNuevo();
        auth.startRegistration(new OtpSendRequest(email));
        String primero = ultimoCodigoEnviadoA(email);
        auth.startRegistration(new OtpSendRequest(email));
        String segundo = ultimoCodigoEnviadoA(email);

        if (!primero.equals(segundo)) {
            assertFalse(auth.verifyRegistrationCode(new OtpRequest(email, primero)).isSuccess());
        }
        assertTrue(auth.verifyRegistrationCode(new OtpRequest(email, segundo)).isSuccess());
    }

    @Test
    void codigoIncorrectoNoValidaElRegistro() {
        String email = emailNuevo();
        auth.startRegistration(new OtpSendRequest(email));
        String incorrecto = ultimoCodigoEnviadoA(email).equals("000000") ? "111111" : "000000";

        AuthResponse respuesta = auth.verifyRegistrationCode(new OtpRequest(email, incorrecto));

        assertFalse(respuesta.isSuccess());
        assertEquals("Código incorrecto", respuesta.getMessage());
    }

    @Test
    void elRecuperoValidaElCodigoSinConsumirloYDespuesCambiaLaContrasena() {
        String email = usuarioExistente();
        auth.sendOtp(new OtpSendRequest(email));
        String codigo = ultimoCodigoEnviadoA(email);

        assertTrue(auth.verifyResetCode(new OtpRequest(email, codigo)).isSuccess());
        AuthResponse respuesta = auth.resetPassword(new ResetPasswordRequest(email, codigo, "Nueva2@x"));

        assertTrue(respuesta.isSuccess(), respuesta.getMessage());
        User user = users.findByEmail(email).orElseThrow();
        assertTrue(passwordEncoder.matches("Nueva2@x", user.getPassword()));
        assertNull(user.getOtpCode(), "el código se consume al cambiar la contraseña");
    }

    private String emailNuevo() {
        return UUID.randomUUID() + "@example.com";
    }

    private String usuarioExistente() {
        User user = new User("Existente", emailNuevo(), passwordEncoder.encode(PASSWORD));
        user.setEmailVerified(true);
        return users.save(user).getEmail();
    }

    private String ultimoCodigoEnviadoA(String email) {
        ArgumentCaptor<String> codigo = ArgumentCaptor.forClass(String.class);
        verify(emailService, atLeastOnce()).enviarOtp(eq(email), codigo.capture());
        return codigo.getValue();
    }
}
