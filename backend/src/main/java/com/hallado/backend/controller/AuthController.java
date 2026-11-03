package com.hallado.backend.controller;

import com.hallado.backend.dto.AuthResponse;
import com.hallado.backend.dto.CompleteRegistrationRequest;
import com.hallado.backend.dto.LoginRequest;
import com.hallado.backend.dto.OtpRequest;
import com.hallado.backend.dto.OtpSendRequest;
import com.hallado.backend.dto.ResetPasswordRequest;
import com.hallado.backend.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // Registro (Punto 1): email → código OTP → nombre y contraseña

    @PostMapping("/register/start")
    public ResponseEntity<AuthResponse> startRegistration(@Valid @RequestBody OtpSendRequest request) {
        return ResponseEntity.ok(authService.startRegistration(request));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<AuthResponse> verifyRegistrationCode(@Valid @RequestBody OtpRequest request) {
        return ResponseEntity.ok(authService.verifyRegistrationCode(request));
    }

    @PostMapping("/register/complete")
    public ResponseEntity<AuthResponse> completeRegistration(@Valid @RequestBody CompleteRegistrationRequest request) {
        return ResponseEntity.ok(authService.completeRegistration(request));
    }

    @PostMapping("/otp/send")
    public ResponseEntity<AuthResponse> sendOtp(@Valid @RequestBody OtpSendRequest request) {
        return ResponseEntity.ok(authService.sendOtp(request));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody OtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/otp/resend")
    public ResponseEntity<AuthResponse> resendOtp(@Valid @RequestBody OtpSendRequest request) {
        return ResponseEntity.ok(authService.resendOtp(request));
    }

    @PostMapping("/password/verify")
    public ResponseEntity<AuthResponse> verifyResetCode(@Valid @RequestBody OtpRequest request) {
        return ResponseEntity.ok(authService.verifyResetCode(request));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}
