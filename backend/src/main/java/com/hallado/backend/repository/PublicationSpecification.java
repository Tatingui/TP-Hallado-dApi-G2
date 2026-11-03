package com.hallado.backend.repository;

import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationStatus;
import com.hallado.backend.model.PublicationType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PublicationSpecification {

    public static Specification<Publication> buildSearchSpecification(
            PublicationType type,
            CategoryEnum category,
            String query,
            String barrio,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {
        return (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by type (Opposite type for Punto 3)
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            // Solo publicaciones vigentes: en reclamo, o abiertas que todavía no vencieron
            // (la tarea programada las marca como vencidas, pero puede no haber corrido aún).
            predicates.add(cb.or(
                    cb.equal(root.get("status"), PublicationStatus.IN_CLAIM),
                    cb.and(
                            cb.equal(root.get("status"), PublicationStatus.OPEN),
                            cb.or(cb.isNull(root.get("expiresAt")),
                                    cb.greaterThan(root.get("expiresAt"), LocalDateTime.now())))));

            // Category filter
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            // Barrio filter
            if (barrio != null && !barrio.trim().isEmpty() && !barrio.equalsIgnoreCase("ALL")) {
                predicates.add(cb.like(cb.lower(root.get("barrio")), "%" + barrio.trim().toLowerCase() + "%"));
            }

            // Query / Keywords search in title and description
            if (query != null && !query.trim().isEmpty()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleMatch, descMatch));
            }

            // Date Range filter
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("eventDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("eventDate"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
