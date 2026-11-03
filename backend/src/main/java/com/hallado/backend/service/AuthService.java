package com.hallado.backend.service;

import com.hallado.backend.config.JwtUtil;
import com.hallado.backend.dto.AuthResponse;
import com.hallado.backend.dto.CompleteRegistrationRequest;
import com.hallado.backend.dto.LoginRequest;
import com.hallado.backend.dto.OtpRequest;
import com.hallado.backend.dto.OtpSendRequest;
import com.hallado.backend.dto.ResetPasswordRequest;
import com.hallado.backend.model.OtpHolder;
import com.hallado.backend.model.PendingRegistration;
import com.hallado.backend.model.User;
import com.hallado.backend.repository.PendingRegistrationRepository;
import com.hallado.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private static final int OTP_VIGENCIA_MINUTOS = 5;
    private static final int MAX_INTENTOS_OTP = 5;
    private static final String OTP_BLOQUEADO = "Superaste los intentos permitidos. Solicitá un código nuevo.";
    private static final String CREDENCIALES_INVALIDAS = "Email o contraseña incorrectos";
    /** Tiempo para completar nombre y contraseña una vez validado el código de registro. */
    private static final int REGISTRO_VIGENCIA_MINUTOS = 15;

    private static final String EMAIL_YA_REGISTRADO = "El email ya está registrado";
    private static final String USUARIO_NO_ENCONTRADO = "Usuario no encontrado";
    private static final String REGISTRO_NO_INICIADO = "No hay un registro en curso para este email. Volvé a empezar.";

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       PendingRegistrationRepository pendingRegistrationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    // ─── Login ───────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        // Mismo mensaje si el email no existe o la contraseña no coincide:
        // así el login no revela qué emails están registrados.
        Optional<User> encontrado = userRepository.findByEmail(request.getEmail());
        if (encontrado.isEmpty()
                || !passwordEncoder.matches(request.getPassword(), encontrado.get().getPassword())) {
            return AuthResponse.error(CREDENCIALES_INVALIDAS);
        }

        User user = encontrado.get();

        // Cuentas creadas con el flujo anterior que nunca verificaron su email.
        if (!user.isEmailVerified()) {
            asignarNuevoOtp(user);
            userRepository.save(user);
            return AuthResponse.pendingVerification(
                "Tu email aún no fue verificado. Te reenviamos el código OTP.");
        }

        return AuthResponse.ok(jwtUtil.generateToken(user.getEmail()), "Login exitoso");
    }

    // ─── Registro (Punto 1): email → código OTP → contraseña ─────────

    /** Paso 1: recibe el email y envía el código. También sirve para reenviarlo. */
    public AuthResponse startRegistration(OtpSendRequest request) {
        String email = request.getEmail();
        if (userRepository.existsByEmail(email)) {
            return AuthResponse.error(EMAIL_YA_REGISTRADO);
        }

        PendingRegistration registro = pendingRegistrationRepository.findByEmail(email)
                .orElseGet(() -> new PendingRegistration(email));
        registro.setVerified(false);
        String otp = generarOtp();
        registro.setOtpCode(otp);
        registro.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_VIGENCIA_MINUTOS));
        registro.setOtpAttempts(0);
        pendingRegistrationRepository.save(registro);
        enviarOtp(email, otp);

        return AuthResponse.ok(null, "Te enviamos un código de verificación.");
    }

    /** Paso 2: valida el código y habilita a completar el registro. No crea el usuario. */
    public AuthResponse verifyRegistrationCode(OtpRequest request) {
        Optional<PendingRegistration> encontrado = pendingRegistrationRepository.findByEmail(request.getEmail());
        if (encontrado.isEmpty()) {
            return AuthResponse.error(REGISTRO_NO_INICIADO);
        }

        PendingRegistration registro = encontrado.get();
        String error = errorDeOtp(registro, request.getCode());
        if (error != null) {
            pendingRegistrationRepository.save(registro);
            return AuthResponse.error(error);
        }

        registro.setVerified(true);
        registro.setOtpExpiresAt(LocalDateTime.now().plusMinutes(REGISTRO_VIGENCIA_MINUTOS));
        pendingRegistrationRepository.save(registro);

        return AuthResponse.ok(null, "Código verificado");
    }

    /** Paso 3: con el código validado, crea el usuario con nombre y contraseña e inicia la sesión. */
    @Transactional
    public AuthResponse completeRegistration(CompleteRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.error(EMAIL_YA_REGISTRADO);
        }

        Optional<PendingRegistration> encontrado = pendingRegistrationRepository.findByEmail(request.getEmail());
        if (encontrado.isEmpty() || !encontrado.get().isVerified()) {
            return AuthResponse.error(REGISTRO_NO_INICIADO);
        }

        PendingRegistration registro = encontrado.get();
        String error = errorDeOtp(registro, request.getCode());
        if (error != null) {
            pendingRegistrationRepository.save(registro);
            return AuthResponse.error(error);
        }

        User user = new User(
                request.getNombre().trim(),
                registro.getEmail(),
                passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(true);
        userRepository.save(user);
        pendingRegistrationRepository.delete(registro);

        return AuthResponse.ok(jwtUtil.generateToken(user.getEmail()), "Registro completado");
    }

    // ─── Verificación de cuentas existentes ──────────────────────────

    public AuthResponse sendOtp(OtpSendRequest request) {
        return regenerarOtp(request.getEmail(), "Código enviado");
    }

    public AuthResponse resendOtp(OtpSendRequest request) {
        return regenerarOtp(request.getEmail(), "Código reenviado");
    }

    /** Verifica el email de una cuenta existente (login de una cuenta sin verificar) e inicia la sesión. */
    public AuthResponse verifyOtp(OtpRequest request) {
        Optional<User> encontrado = userRepository.findByEmail(request.getEmail());
        if (encontrado.isEmpty()) {
            return AuthResponse.error(USUARIO_NO_ENCONTRADO);
        }

        User user = encontrado.get();
        String error = errorDeOtp(user, request.getCode());
        if (error != null) {
            userRepository.save(user);
            return AuthResponse.error(error);
        }

        user.setEmailVerified(true);
        consumirOtp(user);
        userRepository.save(user);

        return AuthResponse.ok(jwtUtil.generateToken(user.getEmail()), "Verificación exitosa");
    }

    // ─── Recupero de contraseña ──────────────────────────────────────

    /** Valida el código de recupero sin consumirlo: se consume al definir la nueva contraseña. */
    public AuthResponse verifyResetCode(OtpRequest request) {
        Optional<User> encontrado = userRepository.findByEmail(request.getEmail());
        if (encontrado.isEmpty()) {
            return AuthResponse.error(USUARIO_NO_ENCONTRADO);
        }

        User user = encontrado.get();
        String error = errorDeOtp(user, request.getCode());
        if (error != null) {
            userRepository.save(user);
            return AuthResponse.error(error);
        }
        return AuthResponse.ok(null, "Código verificado");
    }

    /** Valida el código y actualiza la contraseña del usuario. */
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        Optional<User> encontrado = userRepository.findByEmail(request.getEmail());
        if (encontrado.isEmpty()) {
            return AuthResponse.error(USUARIO_NO_ENCONTRADO);
        }

        User user = encontrado.get();
        String error = errorDeOtp(user, request.getCode());
        if (error != null) {
            userRepository.save(user);
            return AuthResponse.error(error);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        consumirOtp(user);
        userRepository.save(user);

        return AuthResponse.ok(null, "Contraseña actualizada correctamente");
    }

    // ─── OTP ─────────────────────────────────────────────────────────

    /**
     * Devuelve el motivo por el que el código no es válido, o null si es correcto y está vigente.
     * Cada código admite MAX_INTENTOS_OTP intentos fallidos; después hay que pedir uno nuevo.
     * Si devuelve un error, quien llama guarda la entidad para persistir el contador.
     */
    private String errorDeOtp(OtpHolder holder, String recibido) {
        if (holder.getOtpCode() == null || holder.getOtpAttempts() >= MAX_INTENTOS_OTP) {
            return OTP_BLOQUEADO;
        }
        if (!holder.getOtpCode().equals(recibido)) {
            holder.setOtpAttempts(holder.getOtpAttempts() + 1);
            return holder.getOtpAttempts() >= MAX_INTENTOS_OTP ? OTP_BLOQUEADO : "Código incorrecto";
        }
        LocalDateTime vence = holder.getOtpExpiresAt();
        if (vence == null || !vence.isAfter(LocalDateTime.now())) {
            return "El código expiró. Solicitá uno nuevo.";
        }
        return null;
    }

    private AuthResponse regenerarOtp(String email, String mensajeExito) {
        Optional<User> encontrado = userRepository.findByEmail(email);
        if (encontrado.isEmpty()) {
            return AuthResponse.error(USUARIO_NO_ENCONTRADO);
        }

        User user = encontrado.get();
        asignarNuevoOtp(user);
        userRepository.save(user);

        return AuthResponse.ok(null, mensajeExito);
    }

    private void asignarNuevoOtp(User user) {
        String otp = generarOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_VIGENCIA_MINUTOS));
        user.setOtpAttempts(0);
        enviarOtp(user.getEmail(), otp);
    }

    private void consumirOtp(User user) {
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        user.setOtpAttempts(0);
    }

    private void enviarOtp(String email, String otp) {
        emailService.enviarOtp(email, otp);
    }

    private String generarOtp() {
        return String.format("%06d", random.nextInt(1_000_000));
    }
}
