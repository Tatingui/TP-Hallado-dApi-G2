package com.hallado.backend.service;

import com.hallado.backend.dto.AlertRequestDTO;
import com.hallado.backend.dto.AlertResponseDTO;
import com.hallado.backend.exception.BadRequestException;
import com.hallado.backend.exception.ResourceNotFoundException;
import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.model.SearchAlert;
import com.hallado.backend.model.User;
import com.hallado.backend.repository.SearchAlertRepository;
import com.hallado.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AlertService {

    private final SearchAlertRepository searchAlertRepository;
    private final UserRepository userRepository;

    public AlertService(SearchAlertRepository searchAlertRepository, UserRepository userRepository) {
        this.searchAlertRepository = searchAlertRepository;
        this.userRepository = userRepository;
    }

    /**
     * Punto 9: Guardar una búsqueda del buscador como alerta (tipo, categoría, barrio y palabras clave).
     */
    @Transactional
    public AlertResponseDTO createAlert(AlertRequestDTO request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        PublicationType type = parseType(request.getType());
        CategoryEnum category = parseCategory(request.getCategory());
        String barrio = normalizeBarrio(request.getBarrio());
        String query = normalizeText(request.getQuery());

        // Una alerta sin filtros coincidiría con todas las publicaciones
        if (category == null && barrio == null && query == null) {
            throw new BadRequestException("Elegí al menos una categoría, un barrio o palabras clave para guardar la alerta.");
        }

        if (query != null && query.length() > 255) {
            throw new BadRequestException("Las palabras clave no pueden superar los 255 caracteres.");
        }

        if (searchAlertRepository.existsByUserAndTypeAndCategoryAndBarrioAndQuery(user, type, category, barrio, query)) {
            throw new BadRequestException("Ya tenés una alerta guardada con estos criterios.");
        }

        SearchAlert alert = new SearchAlert();
        alert.setUser(user);
        alert.setType(type);
        alert.setCategory(category);
        alert.setBarrio(barrio);
        alert.setQuery(query);
        searchAlertRepository.save(alert);

        return AlertResponseDTO.fromEntity(alert);
    }

    private PublicationType parseType(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new BadRequestException("Debes indicar si perdiste o encontraste algo.");
        }
        try {
            return PublicationType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Tipo de búsqueda inválido.");
        }
    }

    private CategoryEnum parseCategory(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        try {
            return CategoryEnum.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Categoría inválida.");
        }
    }

    // El buscador usa "Todos los barrios" (o vacío) cuando no se filtra por barrio
    private String normalizeBarrio(String value) {
        String barrio = normalizeText(value);
        if (barrio == null || barrio.equalsIgnoreCase("Todos los barrios") || barrio.equalsIgnoreCase("ALL")) {
            return null;
        }
        return barrio;
    }

    private String normalizeText(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
