package com.hallado.backend.service;

import com.hallado.backend.dto.AlertRequestDTO;
import com.hallado.backend.dto.AlertResponseDTO;
import com.hallado.backend.dto.PageResponseDTO;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.exception.BadRequestException;
import com.hallado.backend.exception.ResourceNotFoundException;
import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.model.SearchAlert;
import com.hallado.backend.model.User;
import com.hallado.backend.repository.PublicationRepository;
import com.hallado.backend.repository.PublicationSpecification;
import com.hallado.backend.repository.SearchAlertRepository;
import com.hallado.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final SearchAlertRepository searchAlertRepository;
    private final UserRepository userRepository;
    private final PublicationRepository publicationRepository;

    public AlertService(SearchAlertRepository searchAlertRepository, UserRepository userRepository,
                        PublicationRepository publicationRepository) {
        this.searchAlertRepository = searchAlertRepository;
        this.userRepository = userRepository;
        this.publicationRepository = publicationRepository;
    }

    /**
     * Punto 9: Mis alertas, con la cantidad de publicaciones nuevas de cada una.
     * Las alertas pausadas no cuentan novedades.
     */
    @Transactional(readOnly = true)
    public List<AlertResponseDTO> getMyAlerts(String userEmail) {
        User user = findUser(userEmail);
        return searchAlertRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(alert -> AlertResponseDTO.fromEntity(alert, alert.isActive()
                        ? publicationRepository.count(matchingSpec(alert, alert.getLastSeenAt()))
                        : 0))
                .collect(Collectors.toList());
    }

    /**
     * Punto 9: Publicaciones que coinciden con la alerta, marcando las nuevas (hasNewUpdates).
     */
    @Transactional(readOnly = true)
    public PageResponseDTO<PublicationResponseDTO> getAlertPublications(Long alertId, String userEmail, int page, int size) {
        SearchAlert alert = findMyAlert(alertId, userEmail);
        Page<Publication> publications = publicationRepository.findAll(
                matchingSpec(alert, null),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        return PageResponseDTO.fromPage(publications.map(p -> {
            PublicationResponseDTO dto = PublicationResponseDTO.fromEntity(p);
            dto.setHasNewUpdates(p.getCreatedAt() != null && alert.getLastSeenAt() != null
                    && p.getCreatedAt().isAfter(alert.getLastSeenAt()));
            return dto;
        }));
    }

    @Transactional
    public AlertResponseDTO markAlertAsSeen(Long alertId, String userEmail) {
        SearchAlert alert = findMyAlert(alertId, userEmail);
        alert.setLastSeenAt(LocalDateTime.now());
        searchAlertRepository.save(alert);
        return AlertResponseDTO.fromEntity(alert, 0);
    }

    /**
     * Punto 9: Pausar o reanudar una alerta.
     * Al reanudarla, las novedades se cuentan desde ese momento.
     */
    @Transactional
    public AlertResponseDTO setAlertActive(Long alertId, Boolean active, String userEmail) {
        if (active == null) {
            throw new BadRequestException("Debes indicar si la alerta queda activa o pausada.");
        }
        SearchAlert alert = findMyAlert(alertId, userEmail);
        if (active && !alert.isActive()) {
            alert.setLastSeenAt(LocalDateTime.now());
        }
        alert.setActive(active);
        searchAlertRepository.save(alert);
        return AlertResponseDTO.fromEntity(alert, 0);
    }

    @Transactional
    public void deleteAlert(Long alertId, String userEmail) {
        searchAlertRepository.delete(findMyAlert(alertId, userEmail));
    }

    /**
     * Mismo filtro que el buscador (tipo opuesto, abiertas o en reclamo, categoría, barrio y palabras clave),
     * sin filtro de fecha del suceso, excluyendo las publicaciones propias.
     * Si se indica createdAfter, solo cuenta las creadas después de esa fecha.
     */
    private Specification<Publication> matchingSpec(SearchAlert alert, LocalDateTime createdAfter) {
        PublicationType targetType = alert.getType() == PublicationType.LOST ? PublicationType.FOUND : PublicationType.LOST;
        Long ownerId = alert.getUser().getId();

        Specification<Publication> spec = PublicationSpecification.buildSearchSpecification(
                targetType, alert.getCategory(), alert.getQuery(), alert.getBarrio(), null, null);
        spec = spec.and((root, query, cb) -> cb.notEqual(root.get("user").get("id"), ownerId));
        if (createdAfter != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThan(root.get("createdAt"), createdAfter));
        }
        return spec;
    }

    // Una alerta de otra persona se informa como inexistente (404, no 403)
    private SearchAlert findMyAlert(Long alertId, String userEmail) {
        User user = findUser(userEmail);
        return searchAlertRepository.findByIdAndUser(alertId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta no encontrada"));
    }

    private User findUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    /**
     * Punto 9: Guardar una búsqueda del buscador como alerta (tipo, categoría, barrio y palabras clave).
     */
    @Transactional
    public AlertResponseDTO createAlert(AlertRequestDTO request, String userEmail) {
        User user = findUser(userEmail);

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
