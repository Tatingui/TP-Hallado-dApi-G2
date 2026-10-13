package com.hallado.backend.service;

import com.hallado.backend.dto.PublicProfileDTO;
import com.hallado.backend.dto.UserProfileResponse;
import com.hallado.backend.dto.UserProfileUpdateRequest;
import com.hallado.backend.exception.ResourceNotFoundException;
import com.hallado.backend.model.User;
import com.hallado.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
        return buildUserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UserProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));

        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            user.setNombre(request.getNombre().trim());
        }
        if (request.getTelefono() != null) {
            user.setTelefono(request.getTelefono().trim());
        }
        if (request.getTelefonoVisible() != null) {
            user.setTelefonoVisible(request.getTelefonoVisible());
        }
        if (request.getBarrio() != null) {
            user.setBarrio(request.getBarrio().trim());
        }
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl().trim());
        }

        User updatedUser = userRepository.save(user);
        return buildUserProfileResponse(updatedUser);
    }

    @Transactional(readOnly = true)
    public PublicProfileDTO getPerfilPublico(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        PublicProfileDTO dto = new PublicProfileDTO();
        dto.setId(user.getId());
        dto.setNombre(user.getNombre());
        dto.setBarrio(resolverBarrio(user));
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setMiembroDesde(formatMiembroDesde(user.getCreatedAt()));
        dto.setDevolucionesConcretadas(user.getDevolucionesConcretadas());
        dto.setValoracionesPositivas(user.getValoracionesPositivas());
        dto.setValoracionesNegativas(user.getValoracionesNegativas());
        dto.setPorcentajePositivo(calcularPorcentajePositivo(user));
        dto.setInsignias(calcularInsignias(user));

        return dto;
    }

    private UserProfileResponse buildUserProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setNombre(user.getNombre());
        response.setEmail(user.getEmail());
        response.setTelefono(user.getTelefono());
        response.setTelefonoVisible(user.isTelefonoVisible());
        response.setBarrio(resolverBarrio(user));
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setMiembroDesde(formatMiembroDesde(user.getCreatedAt()));
        response.setDevolucionesConcretadas(user.getDevolucionesConcretadas());
        response.setValoracionesPositivas(user.getValoracionesPositivas());
        response.setValoracionesNegativas(user.getValoracionesNegativas());
        response.setPorcentajePositivo(calcularPorcentajePositivo(user));
        response.setInsignias(calcularInsignias(user));
        return response;
    }

    private String resolverBarrio(User user) {
        if (user.getBarrio() != null && !user.getBarrio().isEmpty()) {
            return user.getBarrio();
        }
        return user.getZona();
    }

    private List<String> calcularInsignias(User user) {
        List<String> insignias = new ArrayList<>();

        if (user.getDevolucionesConcretadas() >= 5) {
            insignias.add("Vecino solidario");
        } else if (user.getDevolucionesConcretadas() >= 1) {
            insignias.add("Primera Devolución");
        }

        if (user.getCreatedAt() != null) {
            long dias = ChronoUnit.DAYS.between(user.getCreatedAt(), LocalDateTime.now());
            if (dias >= 30) {
                insignias.add("Miembro Senior");
            }
        }

        if (calcularPorcentajePositivo(user) >= 90.0 && (user.getValoracionesPositivas() + user.getValoracionesNegativas() >= 3)) {
            insignias.add("Altamente Confiable");
        }

        return insignias;
    }

    private double calcularPorcentajePositivo(User user) {
        int pos = user.getValoracionesPositivas();
        int neg = user.getValoracionesNegativas();
        int total = pos + neg;
        if (total == 0) {
            return 0.0; // Sin valoraciones aún
        }
        return Math.round(((double) pos / total) * 100.0 * 10.0) / 10.0;
    }

    private String formatMiembroDesde(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "Reciente";
        }
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.forLanguageTag("es-ES"));
            String formatted = createdAt.format(formatter);
            return formatted.substring(0, 1).toUpperCase() + formatted.substring(1);
        } catch (Exception e) {
            return createdAt.format(DateTimeFormatter.ofPattern("MM/yyyy"));
        }
    }
}
