package com.hallado.backend.controller;

import com.hallado.backend.dto.ClaimResponseDTO;
import com.hallado.backend.service.ClaimService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/novedades")
public class NovedadesController {

    private static final long TIMEOUT_MS = 25_000;
    private static final long POLLING_INTERVAL_MS = 1_000;

    private final ClaimService claimService;

    public NovedadesController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @GetMapping
    public ResponseEntity<List<ClaimResponseDTO>> novedades(
            @RequestParam(required = false) LocalDateTime ultimaFecha,
            Authentication authentication
    ) throws InterruptedException {
        LocalDateTime since = ultimaFecha != null ? ultimaFecha : LocalDateTime.of(1970, 1, 1, 0, 0);
        long start = System.currentTimeMillis();

        while (System.currentTimeMillis() - start < TIMEOUT_MS) {
            List<ClaimResponseDTO> novedades = claimService.getNovedades(authentication.getName(), since);
            if (!novedades.isEmpty()) {
                return ResponseEntity.ok(novedades);
            }
            Thread.sleep(POLLING_INTERVAL_MS);
        }

        return ResponseEntity.noContent().build();
    }
}
