package com.hallado.backend.controller;

import com.hallado.backend.dto.AlertRequestDTO;
import com.hallado.backend.dto.AlertResponseDTO;
import com.hallado.backend.dto.PageResponseDTO;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.service.AlertService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    /**
     * Punto 9: Guardar una búsqueda como alerta
     */
    @PostMapping
    public ResponseEntity<AlertResponseDTO> createAlert(
            @RequestBody AlertRequestDTO request,
            Authentication authentication
    ) {
        AlertResponseDTO created = alertService.createAlert(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Punto 9: Mis alertas, con la cantidad de publicaciones nuevas de cada una
     */
    @GetMapping
    public ResponseEntity<List<AlertResponseDTO>> getMyAlerts(Authentication authentication) {
        return ResponseEntity.ok(alertService.getMyAlerts(authentication.getName()));
    }

    /**
     * Punto 9: Publicaciones que coinciden con una alerta (las nuevas vienen con hasNewUpdates)
     */
    @GetMapping("/{id}/publications")
    public ResponseEntity<PageResponseDTO<PublicationResponseDTO>> getAlertPublications(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(alertService.getAlertPublications(id, authentication.getName(), page, size));
    }

    /**
     * Punto 9: Marcar la alerta como vista (reinicia el contador de nuevas)
     */
    @PostMapping("/{id}/seen")
    public ResponseEntity<AlertResponseDTO> markAlertAsSeen(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(alertService.markAlertAsSeen(id, authentication.getName()));
    }

    /**
     * Punto 9: Pausar o reanudar una alerta
     */
    @PutMapping("/{id}/active")
    public ResponseEntity<AlertResponseDTO> setAlertActive(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            Authentication authentication
    ) {
        return ResponseEntity.ok(alertService.setAlertActive(id, body.get("active"), authentication.getName()));
    }

    /**
     * Punto 9: Eliminar una alerta
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(
            @PathVariable Long id,
            Authentication authentication
    ) {
        alertService.deleteAlert(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
