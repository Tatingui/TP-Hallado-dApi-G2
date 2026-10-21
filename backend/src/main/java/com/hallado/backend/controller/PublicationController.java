package com.hallado.backend.controller;

import com.hallado.backend.dto.PageResponseDTO;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.service.PublicationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/publications")
public class PublicationController {

    private final PublicationService publicationService;

    public PublicationController(PublicationService publicationService) {
        this.publicationService = publicationService;
    }

    /**
     * Punto 3: Buscador Inicial y Resultados
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<PublicationResponseDTO>> searchPublications(
            @RequestParam(required = false) PublicationType type, // User's condition: LOST or FOUND
            @RequestParam(required = false) CategoryEnum category,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String barrio,
            @RequestParam(required = false) String dateFilter, // TODAY, LAST_3_DAYS, LAST_WEEK, RANGO
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "recent") String sortBy, // recent or distance
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponseDTO<PublicationResponseDTO> result = publicationService.searchPublications(
                type, category, query, barrio, dateFilter, startDate, endDate, lat, lng, sortBy, page, size
        );
        return ResponseEntity.ok(result);
    }
}
