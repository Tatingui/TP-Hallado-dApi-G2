package com.hallado.backend.controller;

import com.hallado.backend.dto.AlertRequestDTO;
import com.hallado.backend.dto.AlertResponseDTO;
import com.hallado.backend.service.AlertService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
}
