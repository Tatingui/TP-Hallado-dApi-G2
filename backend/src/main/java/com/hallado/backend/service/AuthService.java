package com.hallado.backend.service;

import com.hallado.backend.config.JwtUtil;
import com.hallado.backend.dto.AuthResponse;
import com.hallado.backend.dto.LoginRequest;
import com.hallado.backend.dto.OtpRequest;
import com.hallado.backend.dto.OtpSendRequest;
import com.hallado.backend.dto.RegisterRequest;
import com.hallado.backend.dto.ResetPasswordRequest;
import com.hallado.backend.model.User;
import com.hallado.backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private static final int OTP_VIGENCIA_MINUTOS = 5;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> encontrado = userRepository.findByEmail(request.getEmail());
        if (encontrado.isEmpty()) {
            return AuthResponse.error("Usuario no encontrado");
        }

        User user = encontrado.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return AuthResponse.error("Contraseña incorrecta");
        }

        if (!user.isEmailVerified()) {
            return AuthResponse.error("Email no verificado. Ingresá el código OTP enviado a tu correo.");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.ok(token, "Login exitoso");
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.error("El email ya está registrado");
        }

        User user = new User(
                request.getNombre(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()));

        asignarNuevoOtp(user);
        userRepository.save(user);

        return AuthResponse.ok(null, "Registro exitoso. Se envió el código de verificación.");
    }

    public AuthResponse sendOtp(OtpSendRequest request) {
        return regenerarOtp(request.getEmail(), "Código enviado");
    }

    public AuthResponse resendOtp(OtpSendRequest request) {
        return regenerarOtp(request.getEmail(), "Código reenviado");
    }

    public AuthResponse verifyOtp(OtpRequest request) {
        Optional<User> encontrado = userRepository.findByEmail(request.getEmail());
        if (encontrado.isEmpty()) {
            return AuthResponse.error("Usuario no encontrado");
        }

        User user = encontrado.get();

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getCode())) {
            return AuthResponse.error("Código incorrecto");
        }

        if (user.getOtpExpiresAt() == null
                || !user.getOtpExpiresAt().isAfter(LocalDateTime.now())) {
            return AuthResponse.error("El código expiró. Solicitá uno nuevo.");
        }

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.ok(token, "Verificación exitosa");
    }

    /**
     * Valida el OTP y actualiza la contraseña del usuario.
     * Endpoint nuevo para Hallado que no existía en Ronda.
     */
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        Optional<User> encontrado = userRepository.findByEmail(request.getEmail());
        if (encontrado.isEmpty()) {
            return AuthResponse.error("Usuario no encontrado");
        }

        User user = encontrado.get();

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getCode())) {
            return AuthResponse.error("Código incorrecto");
        }

        if (user.getOtpExpiresAt() == null
                || !user.getOtpExpiresAt().isAfter(LocalDateTime.now())) {
            return AuthResponse.error("El código expiró. Solicitá uno nuevo.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return AuthResponse.ok(null, "Contraseña actualizada correctamente");
    }

    private AuthResponse regenerarOtp(String email, String mensajeExito) {
        Optional<User> encontrado = userRepository.findByEmail(email);
        if (encontrado.isEmpty()) {
            return AuthResponse.error("Usuario no encontrado");
        }

        User user = encontrado.get();
        asignarNuevoOtp(user);
        userRepository.save(user);

        return AuthResponse.ok(null, mensajeExito);
    }

    private void asignarNuevoOtp(User user) {
        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_VIGENCIA_MINUTOS));

        emailService.enviarOtp(user.getEmail(), otp);

        log.debug("OTP para {}: {}", user.getEmail(), otp);
    }

    private String generateOtp() {
        return String.format("%06d", random.nextInt(1_000_000));
    }
}
