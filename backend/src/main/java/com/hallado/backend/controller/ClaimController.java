package com.hallado.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hallado.backend.dto.ClaimRequestDTO;
import com.hallado.backend.dto.ClaimResponseDTO;
import com.hallado.backend.dto.PageResponseDTO;
import com.hallado.backend.model.ClaimStatus;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.dto.RatingRequestDTO;
import com.hallado.backend.dto.ResolvedCaseDTO;
import com.hallado.backend.service.ClaimService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/claims")
public class ClaimController {

    private final ClaimService claimService;
    private final ObjectMapper objectMapper;

    public ClaimController(ClaimService claimService, ObjectMapper objectMapper) {
        this.claimService = claimService;
        this.objectMapper = objectMapper;
    }

    /**
     * Punto 7: Iniciar un reclamo ("Es mío" / "Lo encontré")
     */
    @PostMapping("/{publicationId}")
    public ResponseEntity<ClaimResponseDTO> createClaim(
            @PathVariable Long publicationId,
            @RequestParam("claim") String claimJson,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication
    ) {
        try {
            ClaimRequestDTO request = objectMapper.readValue(claimJson, ClaimRequestDTO.class);
            String userEmail = authentication.getName();
            ClaimResponseDTO created = claimService.createClaim(publicationId, request, image, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Punto 7: Responder a un reclamo (Aceptar / Rechazar)
     */
    @PatchMapping("/{claimId}/respond")
    public ResponseEntity<ClaimResponseDTO> respondToClaim(
            @PathVariable Long claimId,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String statusStr = body.get("status");
        if (statusStr == null) return ResponseEntity.badRequest().build();

        ClaimStatus newStatus = ClaimStatus.valueOf(statusStr.toUpperCase());
        String userEmail = authentication.getName();
        ClaimResponseDTO updated = claimService.respondToClaim(claimId, newStatus, userEmail);
        return ResponseEntity.ok(updated);
    }

    /**
     * Punto 8: Proponer un punto de encuentro o sugerir uno alternativo
     */
    @PutMapping("/{claimId}/meeting-point")
    public ResponseEntity<ClaimResponseDTO> proposeMeetingPoint(
            @PathVariable Long claimId,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        ClaimResponseDTO updated = claimService.proposeMeetingPoint(claimId, body.get("address"), authentication.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * Punto 8: Aceptar el punto de encuentro propuesto por la otra parte
     */
    @PostMapping("/{claimId}/meeting-point/accept")
    public ResponseEntity<ClaimResponseDTO> acceptMeetingPoint(
            @PathVariable Long claimId,
            Authentication authentication
    ) {
        ClaimResponseDTO updated = claimService.acceptMeetingPoint(claimId, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * Punto 7: Ver mis reclamos ENVIADOS
     */
    @GetMapping("/my-sent")
    public ResponseEntity<PageResponseDTO<ClaimResponseDTO>> getMySentClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        PageResponseDTO<ClaimResponseDTO> result = claimService.getMySentClaims(userEmail, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * Punto 7: Ver mis reclamos RECIBIDOS
     */
    @GetMapping("/my-received")
    public ResponseEntity<PageResponseDTO<ClaimResponseDTO>> getMyReceivedClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        PageResponseDTO<ClaimResponseDTO> result = claimService.getMyReceivedClaims(userEmail, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/resolved-history")
    public ResponseEntity<List<ResolvedCaseDTO>> getResolvedHistory(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) PublicationType type,
            Authentication authentication) {
        return ResponseEntity.ok(claimService.getResolvedHistory(authentication.getName(), from, to, type));
    }

    @PostMapping("/{claimId}/rating")
    public ResponseEntity<Void> rateResolvedCase(
            @PathVariable Long claimId,
            @RequestBody RatingRequestDTO request,
            Authentication authentication) {
        claimService.rateResolvedCase(claimId, request, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
