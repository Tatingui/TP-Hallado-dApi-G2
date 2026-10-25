package com.hallado.backend.service;

import com.hallado.backend.model.Claim;
import com.hallado.backend.model.ClaimStatus;
import com.hallado.backend.repository.ClaimRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClaimSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(ClaimSchedulerService.class);
    private final ClaimRepository claimRepository;

    public ClaimSchedulerService(ClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    /**
     * Punto 7: "Cada reclamo tiene un estado... y vence automáticamente a las 48 horas si no recibe respuesta."
     * Esta tarea programada corre cada hora (cron) buscando reclamos pendientes que se hayan pasado de las 48 hs.
     */
    @Scheduled(cron = "0 0 * * * *") // Se ejecuta al minuto 0 de cada hora
    @Transactional
    public void expireOldClaims() {
        log.info("Ejecutando proceso de caducidad automática de reclamos (cron).");
        LocalDateTime thresholdDate = LocalDateTime.now().minusHours(48);

        List<Claim> expiredClaims = claimRepository.findByStatusAndClaimDateBefore(ClaimStatus.PENDING, thresholdDate);

        if (!expiredClaims.isEmpty()) {
            for (Claim claim : expiredClaims) {
                claim.setStatus(ClaimStatus.EXPIRED);
                log.info("Reclamo ID {} expiró automáticamente por superar las 48 hs.", claim.getId());
            }
            claimRepository.saveAll(expiredClaims);
        }
    }
}
