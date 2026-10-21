package com.hallado.backend.service;

import com.hallado.backend.dto.PageResponseDTO;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.repository.PublicationRepository;
import com.hallado.backend.repository.PublicationSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PublicationService {

    private final PublicationRepository publicationRepository;

    public PublicationService(PublicationRepository publicationRepository) {
        this.publicationRepository = publicationRepository;
    }

    public PageResponseDTO<PublicationResponseDTO> searchPublications(
            PublicationType userActionType, // User's condition: LOST or FOUND
            CategoryEnum category,
            String query,
            String barrio,
            String dateFilterOption, // TODAY, LAST_3_DAYS, LAST_WEEK, RANGO
            LocalDate startDateParam,
            LocalDate endDateParam,
            Double userLat,
            Double userLng,
            String sortBy, // "recent" or "distance"
            int page,
            int size
    ) {
        // Punto 3: "La búsqueda devuelve las publicaciones del tipo opuesto"
        // If user lost something (userActionType == LOST), search for FOUND items
        // If user found something (userActionType == FOUND), search for LOST items
        PublicationType targetType = null;
        if (userActionType == PublicationType.LOST) {
            targetType = PublicationType.FOUND;
        } else if (userActionType == PublicationType.FOUND) {
            targetType = PublicationType.LOST;
        }

        // Calculate Date Range based on dateFilterOption
        LocalDateTime startDate = null;
        LocalDateTime endDate = LocalDateTime.now();

        if (dateFilterOption != null) {
            switch (dateFilterOption.toUpperCase()) {
                case "TODAY":
                    startDate = LocalDate.now().atStartOfDay();
                    break;
                case "LAST_3_DAYS":
                    startDate = LocalDate.now().minusDays(3).atStartOfDay();
                    break;
                case "LAST_WEEK":
                    startDate = LocalDate.now().minusWeeks(1).atStartOfDay();
                    break;
                case "RANGO":
                case "CUSTOM_RANGE":
                    if (startDateParam != null) {
                        startDate = startDateParam.atStartOfDay();
                    }
                    if (endDateParam != null) {
                        endDate = endDateParam.atTime(LocalTime.MAX);
                    }
                    break;
                default:
                    break;
            }
        }

        Specification<Publication> spec = PublicationSpecification.buildSearchSpecification(
                targetType, category, query, barrio, startDate, endDate
        );

        // Sorting
        Sort sort = Sort.by(Sort.Direction.DESC, "eventDate");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Publication> publicationPage = publicationRepository.findAll(spec, pageable);

        List<PublicationResponseDTO> dtoList = publicationPage.getContent().stream()
                .map(p -> {
                    PublicationResponseDTO dto = PublicationResponseDTO.fromEntity(p);
                    if (userLat != null && userLng != null && p.getLatitude() != null && p.getLongitude() != null) {
                        double dist = calculateDistanceKm(userLat, userLng, p.getLatitude(), p.getLongitude());
                        dto.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        // Sort by distance if requested and coordinates exist
        if ("distance".equalsIgnoreCase(sortBy) && userLat != null && userLng != null) {
            dtoList.sort(Comparator.comparing(PublicationResponseDTO::getDistanceKm, Comparator.nullsLast(Comparator.naturalOrder())));
        }

        Page<PublicationResponseDTO> dtoPage = new PageImpl<>(dtoList, pageable, publicationPage.getTotalElements());
        return PageResponseDTO.fromPage(dtoPage);
    }

    /**
     * Haversine formula to calculate geographical distance between two lat/lng points in km.
     */
    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
