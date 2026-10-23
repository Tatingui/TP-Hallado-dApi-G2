package com.hallado.backend.controller;

import com.hallado.backend.dto.CreatePublicationRequest;
import com.hallado.backend.dto.PageResponseDTO;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.PublicationStatus;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.service.PublicationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/publications")
public class PublicationController {

    private final PublicationService publicationService;
    private final ObjectMapper objectMapper;

    public PublicationController(PublicationService publicationService, ObjectMapper objectMapper) {
        this.publicationService = publicationService;
        this.objectMapper = objectMapper;
    }

    /**
     * Punto 5: Crear una publicación (hallazgo o pérdida).
     * Recibe multipart: campo "publication" (JSON) + campo "images" (archivos opcionales).
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PublicationResponseDTO> createPublication(
            @RequestPart("publication") String publicationJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication
    ) {
        try {
            CreatePublicationRequest request = objectMapper.readValue(publicationJson, CreatePublicationRequest.class);
            String userEmail = authentication.getName();
            PublicationResponseDTO created = publicationService.createPublication(request, images, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Punto 5: Obtener mis publicaciones (del usuario autenticado).
     * Paginado con filtro opcional por estado.
     */
    @GetMapping("/mine")
    public ResponseEntity<PageResponseDTO<PublicationResponseDTO>> getMyPublications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) PublicationStatus status,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        PageResponseDTO<PublicationResponseDTO> result =
                publicationService.getMyPublications(userEmail, status, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * Obtener una publicación por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PublicationResponseDTO> getPublicationById(@PathVariable Long id) {
        try {
            PublicationResponseDTO dto = publicationService.getPublicationById(id);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Punto 3: Buscador Inicial y Resultados (existente).
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<PublicationResponseDTO>> searchPublications(
            @RequestParam(required = false) PublicationType type,
            @RequestParam(required = false) CategoryEnum category,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String barrio,
            @RequestParam(required = false) String dateFilter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "recent") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponseDTO<PublicationResponseDTO> result = publicationService.searchPublications(
                type, category, query, barrio, dateFilter, startDate, endDate, lat, lng, sortBy, page, size
        );
        return ResponseEntity.ok(result);
    }
}
