package com.hallado.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hallado.backend.dto.CreatePublicationRequest;
import com.hallado.backend.dto.UpdatePublicationRequest;
import com.hallado.backend.dto.PublicationEditResponseDTO;
import com.hallado.backend.dto.PageResponseDTO;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.PublicationStatus;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.service.PublicationService;

@RestController
@RequestMapping("/publications")
public class PublicationController {

    private static final Logger log = LoggerFactory.getLogger(PublicationController.class);

    private final PublicationService publicationService;
    private final ObjectMapper objectMapper;

    public PublicationController(PublicationService publicationService, ObjectMapper objectMapper) {
        this.publicationService = publicationService;
        this.objectMapper = objectMapper;
    }

    @PutMapping("/{id}")
    public ResponseEntity<PublicationResponseDTO> updatePublication(
            @PathVariable Long id,
            @RequestBody UpdatePublicationRequest request,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(publicationService.updatePublication(id, request, authentication.getName()));
        } catch (com.hallado.backend.exception.ForbiddenException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }

    }

    @GetMapping("/{id}/edit")
    public ResponseEntity<PublicationEditResponseDTO> getPublicationForEdit(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(publicationService.getPublicationForEdit(id, authentication.getName()));
        } catch (com.hallado.backend.exception.ForbiddenException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Punto 5: Crear una publicación (hallazgo o pérdida).
     * Recibe multipart: campo "publication" (JSON) + campo "images" (archivos opcionales).
     */
    @PostMapping
    public ResponseEntity<PublicationResponseDTO> createPublication(
            @RequestParam("publication") String publicationJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
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
            log.error("Error al crear publicación: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<Map<String, Object>> followPublication(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            return ResponseEntity.ok(publicationService.followPublication(userEmail, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/followed")
    public ResponseEntity<PageResponseDTO<PublicationResponseDTO>> getFollowedPublications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        PageResponseDTO<PublicationResponseDTO> result = publicationService.getFollowedPublications(userEmail, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/follow")
    public ResponseEntity<Map<String, Object>> getFollowStatus(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            return ResponseEntity.ok(publicationService.getFollowStatus(userEmail, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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

    @PostMapping("/{id}/seen")
    public ResponseEntity<Map<String, Object>> markPublicationAsSeen(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            return ResponseEntity.ok(publicationService.markPublicationAsSeen(userEmail, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<Map<String, Object>> unfollowPublication(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            return ResponseEntity.ok(publicationService.unfollowPublication(userEmail, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
