package com.hallado.backend.controller;

import com.hallado.backend.dto.PublicProfileDTO;
import com.hallado.backend.dto.UserProfileResponse;
import com.hallado.backend.dto.UserProfileUpdateRequest;
import com.hallado.backend.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/usuarios")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/usuarios/me
     * Retorna el perfil completo del usuario autenticado.
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        String email = getEmailFromToken();
        return ResponseEntity.ok(userService.getProfile(email));
    }

    /**
     * PUT /api/usuarios/me
     * Actualiza los datos editables del perfil del usuario autenticado.
     */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @Valid @RequestBody UserProfileUpdateRequest request) {
        String email = getEmailFromToken();
        return ResponseEntity.ok(userService.updateProfile(email, request));
    }

    /**
     * PUT /api/usuarios/me/imagen
     * Sube una imagen de perfil desde la galería del usuario.
     * Recibe multipart/form-data con un campo "image".
     */
    @PostMapping("/me/imagen")
    public ResponseEntity<UserProfileResponse> updateProfileImage(
            @RequestParam("image") MultipartFile image) {
        String email = getEmailFromToken();
        return ResponseEntity.ok(userService.updateProfileImage(email, image));
    }

    /**
     * GET /api/usuarios/{id}/publico
     * Retorna el perfil público de cualquier usuario por ID.
     * Oculta email, teléfono e historial de publicaciones.
     */
    @GetMapping("/{id}/publico")
    public ResponseEntity<PublicProfileDTO> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getPerfilPublico(id));
    }

    private String getEmailFromToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}
