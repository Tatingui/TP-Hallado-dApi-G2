package com.hallado.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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
import com.fasterxml.jackson.core.JsonProcessingException;

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

    private final PublicationService publicationService;
    private final ObjectMapper objectMapper;
    private final com.hallado.backend.service.IdempotentPublicationService idempotentPublications;

    public PublicationController(PublicationService publicationService, ObjectMapper objectMapper, com.hallado.backend.service.IdempotentPublicationService idempotentPublications) {
        this.publicationService = publicationService;
        this.objectMapper = objectMapper;
        this.idempotentPublications = idempotentPublications;
    }

    @PutMapping("/{id}")
    public ResponseEntity<PublicationResponseDTO> updatePublication(
            @PathVariable Long id,
            @RequestBody UpdatePublicationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(publicationService.updatePublication(id, request, authentication.getName()));
    }

    @GetMapping("/{id}/edit")
    public ResponseEntity<PublicationEditResponseDTO> getPublicationForEdit(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(publicationService.getPublicationForEdit(id, authentication.getName()));
    }

    /**
     * Punto 5: Crear una publicación (hallazgo o pérdida).
     * Recibe multipart: campo "publication" (JSON) + campo "images" (archivos opcionales).
     */
    @PostMapping
    public ResponseEntity<PublicationResponseDTO> createPublication(
            @RequestParam("publication") String publicationJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @org.springframework.web.bind.annotation.RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            Authentication authentication
    ) throws JsonProcessingException {
        CreatePublicationRequest request = objectMapper.readValue(publicationJson, CreatePublicationRequest.class);
        PublicationResponseDTO created = idempotentPublications.create(
                request, images, authentication.getName(), idempotencyKey);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<Map<String, Object>> followPublication(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(publicationService.followPublication(authentication.getName(), id));
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

    /**
     * Punto 9: cantidad de publicaciones seguidas que cambiaron de estado (para el indicador de novedad)
     */
    @GetMapping("/followed/updates-count")
    public ResponseEntity<Map<String, Long>> getFollowedUpdatesCount(Authentication authentication) {
        return ResponseEntity.ok(Map.of("count", publicationService.countFollowedWithUpdates(authentication.getName())));
    }

    @GetMapping("/{id}/follow")
    public ResponseEntity<Map<String, Object>> getFollowStatus(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(publicationService.getFollowStatus(authentication.getName(), id));
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
        return ResponseEntity.ok(publicationService.getPublicationById(id));
    }

    @PostMapping("/{id}/seen")
    public ResponseEntity<Map<String, Object>> markPublicationAsSeen(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(publicationService.markPublicationAsSeen(authentication.getName(), id));
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
        return ResponseEntity.ok(publicationService.unfollowPublication(authentication.getName(), id));
    }

    /**
     * DELETE /api/publications/{id}
     * Elimina una publicación propia (solo si está OPEN).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePublication(@PathVariable Long id, Authentication authentication) {
        publicationService.deletePublication(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Punto 5: renovar una publicación vencida por otros 30 días.
     */
    @PostMapping("/{id}/renew")
    public ResponseEntity<PublicationResponseDTO> renewPublication(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(publicationService.renewPublication(id, authentication.getName()));
    }

}
